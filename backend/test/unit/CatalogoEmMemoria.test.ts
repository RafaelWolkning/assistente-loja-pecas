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

  it("cobre várias categorias de tecnologia (inclui monitores)", () => {
    const categorias = new Set(PRODUTOS_PADRAO.map((p) => p.categoria));

    expect(categorias.has("Monitores")).toBe(true);
    expect(categorias.has("Processadores")).toBe(true);
    expect(categorias.has("Periféricos")).toBe(true);
    expect(categorias.size).toBeGreaterThanOrEqual(8);
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

  describe("buscarPorNome", () => {
    const catalogo = new CatalogoEmMemoria();

    it("encontra pelo nome aproximado (ignora acentos e caixa)", () => {
      const produto = catalogo.buscarPorNome('monitor lg ultrawide 29"');

      expect(produto?.id).toBe("monitor-lg-ultrawide-29");
    });

    it("encontra placas de vídeo por tokens parciais", () => {
      const produto = catalogo.buscarPorNome("RTX 4070 Super");

      expect(produto?.id).toBe("gpu-rtx-4070-super");
    });

    it("retorna undefined quando não há correspondência suficiente", () => {
      expect(catalogo.buscarPorNome("Fogão elétrico")).toBeUndefined();
      expect(catalogo.buscarPorNome("")).toBeUndefined();
    });
  });
});
