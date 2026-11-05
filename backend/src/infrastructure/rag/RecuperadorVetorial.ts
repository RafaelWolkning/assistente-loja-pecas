import type { TrechoConhecimento } from "../../domain/entities/Conhecimento.js";
import type { Embedador } from "../../domain/ports/Embedador.js";
import type { RecuperadorConhecimento } from "../../domain/ports/RecuperadorConhecimento.js";
import {
  DOCUMENTOS_CONHECIMENTO,
  type DocumentoConhecimento,
} from "./documentos.js";

function similaridadeCosseno(a: readonly number[], b: readonly number[]): number {
  const tamanho = Math.min(a.length, b.length);
  let produto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < tamanho; i += 1) {
    produto += a[i]! * b[i]!;
    normaA += a[i]! * a[i]!;
    normaB += b[i]! * b[i]!;
  }
  if (normaA === 0 || normaB === 0) {
    return 0;
  }
  return produto / (Math.sqrt(normaA) * Math.sqrt(normaB));
}

/**
 * Recuperador vetorial: vetoriza os documentos (uma vez, de forma preguiçosa) e
 * busca por similaridade de cosseno com o embedding da consulta.
 */
export class RecuperadorVetorial implements RecuperadorConhecimento {
  private indice?: Array<{ documento: DocumentoConhecimento; vetor: number[] }>;

  constructor(
    private readonly embedador: Embedador,
    private readonly documentos: readonly DocumentoConhecimento[] = DOCUMENTOS_CONHECIMENTO,
  ) {}

  async buscar(consulta: string, limite: number): Promise<TrechoConhecimento[]> {
    const indice = await this.garantirIndice();
    if (indice.length === 0) {
      return [];
    }

    const [vetorConsulta] = await this.embedador.gerarEmbeddings([consulta]);
    if (!vetorConsulta) {
      return [];
    }

    return indice
      .map(({ documento, vetor }) => ({
        id: documento.id,
        titulo: documento.titulo,
        conteudo: documento.conteudo,
        pontuacao: similaridadeCosseno(vetorConsulta, vetor),
      }))
      .filter((trecho) => trecho.pontuacao > 0)
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .slice(0, limite);
  }

  private async garantirIndice(): Promise<Array<{ documento: DocumentoConhecimento; vetor: number[] }>> {
    if (this.indice) {
      return this.indice;
    }

    const vetores = await this.embedador.gerarEmbeddings(
      this.documentos.map((documento) => `${documento.titulo}. ${documento.conteudo}`),
    );

    this.indice = this.documentos.map((documento, indice) => ({
      documento,
      vetor: vetores[indice] ?? [],
    }));

    return this.indice;
  }
}
