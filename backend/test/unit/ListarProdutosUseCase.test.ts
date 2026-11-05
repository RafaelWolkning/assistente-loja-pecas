import { describe, expect, it } from "vitest";

import { ListarProdutosUseCase } from "../../src/application/usecases/ListarProdutosUseCase.js";
import type { Produto } from "../../src/domain/entities/Produto.js";
import type { CatalogoProdutos } from "../../src/domain/ports/CatalogoProdutos.js";

class CatalogoFake implements CatalogoProdutos {
  constructor(private readonly produtos: Produto[]) {}
  listar(): readonly Produto[] {
    return this.produtos;
  }
  buscarPorNome(nome: string): Produto | undefined {
    return this.produtos.find((produto) => produto.nome === nome);
  }
}

const produto: Produto = {
  id: "x",
  nome: "Peça X",
  categoria: "Teste",
  preco: 10,
  descricao: "desc",
  estoque: 1,
};

describe("ListarProdutosUseCase", () => {
  it("retorna os produtos do catálogo", () => {
    const casoDeUso = new ListarProdutosUseCase(new CatalogoFake([produto]));

    expect(casoDeUso.executar()).toEqual([produto]);
  });
});
