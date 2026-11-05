import { GoogleGenAI } from "@google/genai";

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

/**
 * Adaptador de infraestrutura que implementa a porta `RespostaGenerator`
 * usando o SDK oficial `@google/genai`.
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

  async gerarResposta(entrada: EntradaAtendimento): Promise<string> {
    try {
      const resposta = await this.cliente.models.generateContent({
        model: this.opcoes.modelo,
        contents: this.montarConteudo(entrada),
        config: {
          systemInstruction: this.opcoes.instrucaoSistema,
          temperature: this.opcoes.temperatura ?? 0.6,
        },
      });

      const texto = resposta.text?.trim();
      if (!texto) {
        throw new ErroDeIntegracaoIA("A IA não retornou texto na resposta.");
      }

      return texto;
    } catch (erro) {
      if (erro instanceof ErroDeIntegracaoIA) {
        throw erro;
      }
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      throw new ErroDeIntegracaoIA(
        `Falha ao consultar o provedor de IA: ${mensagem}`,
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
}
