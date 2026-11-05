import { GoogleGenAI } from "@google/genai";

import { ErroDeIntegracaoIA } from "../../domain/errors/ErroDeIntegracaoIA.js";
import type { Embedador } from "../../domain/ports/Embedador.js";

export interface OpcoesEmbedador {
  apiKey: string;
  modelo: string;
}

/**
 * Adaptador de embeddings usando o SDK oficial `@google/genai`.
 * Envia todos os textos em uma única chamada (batch) para economizar cota.
 */
export class EmbedadorGemini implements Embedador {
  private readonly cliente: GoogleGenAI;

  constructor(private readonly opcoes: OpcoesEmbedador) {
    this.cliente = new GoogleGenAI({ apiKey: opcoes.apiKey });
  }

  async gerarEmbeddings(textos: string[]): Promise<number[][]> {
    if (textos.length === 0) {
      return [];
    }

    try {
      const resposta = await this.cliente.models.embedContent({
        model: this.opcoes.modelo,
        contents: textos,
      });
      return (resposta.embeddings ?? []).map((embedding) => embedding.values ?? []);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      throw new ErroDeIntegracaoIA(`Falha ao gerar embeddings: ${mensagem}`, erro);
    }
  }
}
