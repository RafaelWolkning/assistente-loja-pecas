import type { Produto } from "../entities/Produto.js";

/**
 * Porta de saída para leitura do catálogo de produtos.
 */
export interface CatalogoProdutos {
  listar(): readonly Produto[];
}
