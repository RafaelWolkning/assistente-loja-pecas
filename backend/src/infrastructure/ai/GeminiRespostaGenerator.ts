import { GoogleGenAI } from "@google/genai";

import type {
  Atendimento,
  FonteWeb,
  ProdutoSugerido,
} from "../../domain/entities/Atendimento.js";
import type { TrechoConhecimento } from "../../domain/entities/Conhecimento.js";
import { ErroDeIntegracaoIA } from "../../domain/errors/ErroDeIntegracaoIA.js";
import type {
  EntradaAtendimento,
  RespostaGenerator,
} from "../../domain/ports/RespostaGenerator.js";

export interface OpcoesGemini {
  apiKey: string;
  modelo: string;
  instrucaoSistema: string;
  temperatura?: number;
  /** Quando true, habilita o Google Search grounding (com fallback automático). */
  usarBuscaWeb?: boolean;
}

interface ParteConteudo {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

const MAXIMO_FONTES = 5;

/** JSON Schema do atendimento estruturado que a IA deve devolver. */
const ESQUEMA_ATENDIMENTO = {
  type: "object",
  properties: {
    assuntoDeTecnologia: {
      type: "boolean",
      description:
        "true se a pergunta for sobre computadores, peças ou tecnologia. false para assuntos fora desse escopo (ex.: carros, culinária).",
    },
    mensagem: {
      type: "string",
      description:
        "Resposta em português, em parágrafos curtos separados por linha em branco. Sem preços nem tabelas.",
    },
    produtos: {
      type: "array",
      description: "Produtos de tecnologia citados (0 a 6).",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          categoria: { type: "string" },
          descricao: { type: "string" },
          precoReferencia: {
            type: "number",
            description: "Preço de referência em reais (BRL).",
          },
        },
        required: ["nome", "categoria", "descricao", "precoReferencia"],
        additionalProperties: false,
      },
    },
  },
  required: ["assuntoDeTecnologia", "mensagem", "produtos"],
  additionalProperties: false,
} as const;

/**
 * Adaptador de infraestrutura que implementa a porta `RespostaGenerator`
 * usando o SDK oficial `@google/genai` com SAÍDA ESTRUTURADA (JSON Schema),
 * injeção do conhecimento recuperado (RAG) e, opcionalmente, Google Search.
 *
 * É o ÚNICO lugar do backend que conhece o provedor de IA. Nos testes, esse
 * adaptador é substituído por um fake (mock), então nenhuma chamada real é
 * feita no CI.
 */
export class GeminiRespostaGenerator implements RespostaGenerator {
  private readonly cliente: GoogleGenAI;
  /** Circuit breaker: desliga a busca depois da primeira falha. */
  private buscaDesativada = false;

  constructor(private readonly opcoes: OpcoesGemini) {
    this.cliente = new GoogleGenAI({ apiKey: opcoes.apiKey });
  }

  async gerarAtendimento(entrada: EntradaAtendimento): Promise<Atendimento> {
    const usarBusca = Boolean(this.opcoes.usarBuscaWeb) && !this.buscaDesativada;

    try {
      return await this.chamar(entrada, usarBusca);
    } catch (erro) {
      if (usarBusca) {
        // A busca pode não estar disponível (cota/plano) — tenta de novo sem ela.
        this.buscaDesativada = true;
        try {
          return await this.chamar(entrada, false);
        } catch (erroFallback) {
          throw this.encapsular(erroFallback, "Falha ao consultar o provedor de IA");
        }
      }
      throw this.encapsular(erro, "Falha ao consultar o provedor de IA");
    }
  }

  private async chamar(entrada: EntradaAtendimento, usarBusca: boolean): Promise<Atendimento> {
    const resposta = await this.cliente.models.generateContent({
      model: this.opcoes.modelo,
      contents: this.montarConteudo(entrada),
      config: {
        systemInstruction: this.montarInstrucao(entrada.conhecimento),
        temperature: this.opcoes.temperatura ?? 0.6,
        responseMimeType: "application/json",
        responseJsonSchema: ESQUEMA_ATENDIMENTO,
        ...(usarBusca ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });

    const texto = resposta.text?.trim();
    if (!texto) {
      throw new ErroDeIntegracaoIA("A IA não retornou conteúdo na resposta.");
    }

    const fontesWeb = usarBusca ? this.extrairFontes(resposta) : [];
    return this.interpretar(texto, fontesWeb);
  }

  private montarInstrucao(conhecimento?: readonly TrechoConhecimento[]): string {
    if (!conhecimento || conhecimento.length === 0) {
      return this.opcoes.instrucaoSistema;
    }

    const trechos = conhecimento
      .map((trecho) => `### ${trecho.titulo}\n${trecho.conteudo}`)
      .join("\n\n");

    return `${this.opcoes.instrucaoSistema}\n\nBase de conhecimento técnico (use quando for relevante; não contradiga o catálogo):\n${trechos}`;
  }

  private montarConteudo(entrada: EntradaAtendimento): ParteConteudo[] {
    const historico: ParteConteudo[] = entrada.historico.map((mensagem) => ({
      role: mensagem.papel === "cliente" ? "user" : "model",
      parts: [{ text: mensagem.conteudo }],
    }));

    return [
      ...historico,
      { role: "user", parts: [{ text: entrada.pergunta }] },
    ];
  }

  private extrairFontes(resposta: {
    candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }>;
  }): FonteWeb[] {
    const chunks = resposta.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const vistos = new Set<string>();
    const fontes: FonteWeb[] = [];

    for (const chunk of chunks) {
      const url = chunk.web?.uri;
      if (!url || vistos.has(url)) {
        continue;
      }
      vistos.add(url);
      fontes.push({ titulo: chunk.web?.title?.trim() || url, url });
      if (fontes.length >= MAXIMO_FONTES) {
        break;
      }
    }

    return fontes;
  }

  private interpretar(texto: string, fontesWeb: FonteWeb[]): Atendimento {
    let cru: unknown;
    try {
      cru = JSON.parse(texto);
    } catch {
      throw new ErroDeIntegracaoIA("A IA retornou um JSON inválido.");
    }

    const dados = (cru ?? {}) as {
      assuntoDeTecnologia?: unknown;
      mensagem?: unknown;
      produtos?: unknown;
    };

    const mensagem = typeof dados.mensagem === "string" ? dados.mensagem : "";
    const assuntoDeTecnologia = dados.assuntoDeTecnologia !== false;
    const listaBruta = Array.isArray(dados.produtos) ? dados.produtos : [];

    const produtos = listaBruta.flatMap((item): ProdutoSugerido[] => {
      if (!item || typeof item !== "object") {
        return [];
      }
      const registro = item as Record<string, unknown>;
      const nome = typeof registro.nome === "string" ? registro.nome.trim() : "";
      if (nome.length === 0) {
        return [];
      }
      return [
        {
          nome,
          categoria:
            typeof registro.categoria === "string" && registro.categoria.trim() !== ""
              ? registro.categoria.trim()
              : "Tecnologia",
          descricao: typeof registro.descricao === "string" ? registro.descricao.trim() : "",
          precoReferencia:
            typeof registro.precoReferencia === "number" &&
            Number.isFinite(registro.precoReferencia)
              ? Math.max(0, registro.precoReferencia)
              : 0,
        },
      ];
    });

    if (mensagem.trim() === "" && produtos.length === 0) {
      throw new ErroDeIntegracaoIA("A IA retornou um atendimento vazio.");
    }

    return { mensagem, produtos, assuntoDeTecnologia, fontesWeb };
  }

  private encapsular(erro: unknown, prefixo: string): ErroDeIntegracaoIA {
    if (erro instanceof ErroDeIntegracaoIA) {
      return erro;
    }
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    const texto = mensagem.includes("JSON") ? mensagem : `${prefixo}: ${mensagem}`;
    return new ErroDeIntegracaoIA(texto, erro);
  }
}
