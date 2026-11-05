import type { TrechoConhecimento } from "../../domain/entities/Conhecimento.js";
import type { RecuperadorConhecimento } from "../../domain/ports/RecuperadorConhecimento.js";
import {
  DOCUMENTOS_CONHECIMENTO,
  type DocumentoConhecimento,
} from "./documentos.js";
import { tokenizar } from "./texto.js";

/**
 * Recuperador lexical (BM25 simplificado). Não usa nenhuma API — é o
 * "plano B" garantido quando os embeddings estão indisponíveis (ex.: cota).
 */
export class RecuperadorLexical implements RecuperadorConhecimento {
  private readonly documentos: readonly DocumentoConhecimento[];
  private readonly idf: Map<string, number>;

  constructor(documentos: readonly DocumentoConhecimento[] = DOCUMENTOS_CONHECIMENTO) {
    this.documentos = documentos;
    this.idf = this.calcularIdf(documentos);
  }

  async buscar(consulta: string, limite: number): Promise<TrechoConhecimento[]> {
    const termos = tokenizar(consulta);
    if (termos.length === 0) {
      return [];
    }

    return this.documentos
      .map((documento) => {
        const contagem = new Map<string, number>();
        for (const token of tokenizar(`${documento.titulo} ${documento.conteudo}`)) {
          contagem.set(token, (contagem.get(token) ?? 0) + 1);
        }

        let pontuacao = 0;
        for (const termo of new Set(termos)) {
          const frequencia = contagem.get(termo) ?? 0;
          if (frequencia > 0) {
            pontuacao += (this.idf.get(termo) ?? 1) * Math.min(frequencia, 3);
          }
        }
        return {
          id: documento.id,
          titulo: documento.titulo,
          conteudo: documento.conteudo,
          pontuacao,
        };
      })
      .filter((trecho) => trecho.pontuacao > 0)
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .slice(0, limite);
  }

  private calcularIdf(documentos: readonly DocumentoConhecimento[]): Map<string, number> {
    const frequencia = new Map<string, number>();
    for (const documento of documentos) {
      for (const token of new Set(tokenizar(`${documento.titulo} ${documento.conteudo}`))) {
        frequencia.set(token, (frequencia.get(token) ?? 0) + 1);
      }
    }

    const total = documentos.length;
    const idf = new Map<string, number>();
    for (const [token, ocorrencias] of frequencia) {
      idf.set(token, Math.log(1 + total / (1 + ocorrencias)) + 1);
    }
    return idf;
  }
}
