import { GoogleGenAI } from "@google/genai";

import type {
  Atendimento,
  ProdutoSugerido,
} from "../../domain/entities/Atendimento.js";
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
}

interface ParteConteudo {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/** JSON Schema do atendimento estruturado que a IA deve devolver. */
const ESQUEMA_ATENDIMENTO = {
  type: "object",
  properties: {
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
          categoria: {
            type: "string",
            description:
              "Ex.: Processadores, Placas de vídeo, Monitores, Periféricos, Notebooks.",
          },
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
  required: ["mensagem", "produtos"],
  additionalProperties: false,
} as const;

/**
 * Adaptador de infraestrutura que implementa a porta `RespostaGenerator`
 * usando o SDK oficial `@google/genai` com SAÍDA ESTRUTURADA (JSON Schema).
 *
 * É o ÚNICO lugar do backend que conhece o provedor de IA. Nos testes, esse
 * adaptador é substituído por um fake (mock), então nenhuma chamada real é
 * feita no CI.
 */
export class GeminiRespostaGenerator implements RespostaGenerator {
  private readonly cliente: GoogleGenAI;

  constructor(private readonly opcoes: OpcoesGemini) {
    this.cliente = new GoogleGenAI({ apiKey: opcoes.apiKey });
  }

  async gerarAtendimento(entrada: EntradaAtendimento): Promise<Atendimento> {
    try {
      const resposta = await this.cliente.models.generateContent({
        model: this.opcoes.modelo,
        contents: this.montarConteudo(entrada),
        config: {
          systemInstruction: this.opcoes.instrucaoSistema,
          temperature: this.opcoes.temperatura ?? 0.6,
          responseMimeType: "application/json",
          responseJsonSchema: ESQUEMA_ATENDIMENTO,
        },
      });

      const texto = resposta.text?.trim();
      if (!texto) {
        throw new ErroDeIntegracaoIA("A IA não retornou conteúdo na resposta.");
      }

      return this.interpretar(texto);
    } catch (erro) {
      if (erro instanceof ErroDeIntegracaoIA) {
        throw erro;
      }
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      const prefixo = mensagem.includes("JSON") ? mensagem : `Falha ao consultar o provedor de IA: ${mensagem}`;
      throw new ErroDeIntegracaoIA(
        prefixo,
        erro,
      );
    }
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

  private interpretar(texto: string): Atendimento {
    let cru: unknown;
    try {
      cru = JSON.parse(texto);
    } catch {
      throw new ErroDeIntegracaoIA("A IA retornou um JSON inválido.");
    }

    const dados = (cru ?? {}) as { mensagem?: unknown; produtos?: unknown };
    const mensagem = typeof dados.mensagem === "string" ? dados.mensagem : "";
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

    return { mensagem, produtos };
  }
}
