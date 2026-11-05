import { describe, expect, it } from "vitest";

import {
  CatalogoEmMemoria,
  PRODUTOS_PADRAO,
} from "../../src/infrastructure/catalog/CatalogoEmMemoria.js";

describe("CatalogoEmMemoria", () => {
  it("retorna o catálogo padrão quando nenhum é informado", () => {
    const catalogo = new CatalogoEmMemoria();

    expect(catalogo.listar()).toBe(PRODUTOS_PADRAO);
    expect(catalogo.listar().length).toBeGreaterThan(0);
  });

  it("retorna o catálogo customizado informado", () => {
    const produtos = [
      {
        id: "1",
        nome: "SSD",
        categoria: "Armazenamento",
        preco: 100,
        descricao: "rápido",
        estoque: 3,
      },
    ];
    const catalogo = new CatalogoEmMemoria(produtos);

    expect(catalogo.listar()).toEqual(produtos);
  });
});
