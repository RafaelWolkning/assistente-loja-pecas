import type { Produto } from "../entities/Produto.js";

/**
 * Porta de saída para leitura do catálogo de produtos.
 */
export interface CatalogoProdutos {
  listar(): readonly Produto[];
  /** Busca um produto pelo nome (correspondência tolerante). */
  buscarPorNome(nome: string): Produto | undefined;
}
