import type { TrechoConhecimento } from "../../domain/entities/Conhecimento.js";
import type { RecuperadorConhecimento } from "../../domain/ports/RecuperadorConhecimento.js";

/**
 * Recuperador com fallback: tenta o principal (vetorial/embeddings) e, se falhar
 * ou não achar nada, usa o reserva (lexical, sem cota). Garante que o RAG
 * funcione mesmo quando os embeddings estão indisponíveis.
 */
export class RecuperadorHibrido implements RecuperadorConhecimento {
  constructor(
    private readonly principal: RecuperadorConhecimento,
    private readonly reserva: RecuperadorConhecimento,
  ) {}

  async buscar(consulta: string, limite: number): Promise<TrechoConhecimento[]> {
    try {
      const trechos = await this.principal.buscar(consulta, limite);
      if (trechos.length > 0) {
        return trechos;
      }
    } catch {
      // embeddings indisponíveis (ex.: cota) — segue para o reserva
    }

    return this.reserva.buscar(consulta, limite);
  }
}
