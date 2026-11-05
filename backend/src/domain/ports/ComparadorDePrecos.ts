import type { PrecoLoja, ProdutoSugerido } from "../entities/Atendimento.js";

/**
 * Porta de saída para comparação de preços entre as lojas parceiras.
 * A implementação concreta fica na infraestrutura (hoje um simulador
 * determinístico; no futuro, integrações reais).
 */
export interface ComparadorDePrecos {
  comparar(produto: ProdutoSugerido): PrecoLoja[];
}
