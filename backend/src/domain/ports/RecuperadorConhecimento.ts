import type { TrechoConhecimento } from "../entities/Conhecimento.js";

/**
 * Porta de saída: recupera trechos relevantes da base de conhecimento para uma
 * consulta. Implementações podem usar embeddings (vetorial) ou busca lexical,
 * com fallback entre elas.
 */
export interface RecuperadorConhecimento {
  buscar(consulta: string, limite: number): Promise<TrechoConhecimento[]>;
}
