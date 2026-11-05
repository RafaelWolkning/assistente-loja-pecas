import type { Produto } from "../../domain/entities/Produto.js";
import type { CatalogoProdutos } from "../../domain/ports/CatalogoProdutos.js";

/**
 * Caso de uso: listar os produtos do catálogo (endpoint GET /produtos).
 * Serve de contexto para o frontend e como fonte de grounding da IA.
 */
export class ListarProdutosUseCase {
  constructor(private readonly catalogo: CatalogoProdutos) {}

  executar(): readonly Produto[] {
    return this.catalogo.listar();
  }
}
