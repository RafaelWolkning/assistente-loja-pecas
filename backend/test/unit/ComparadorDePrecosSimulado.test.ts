import { describe, expect, it } from "vitest";

import {
  ComparadorDePrecosSimulado,
  LOJAS_PARCEIRAS,
} from "../../src/infrastructure/precos/ComparadorDePrecosSimulado.js";

const produto = {
  nome: "Monitor Gamer Samsung Odyssey G5",
  categoria: "Monitores",
  descricao: "27 polegadas 165Hz",
  precoReferencia: 1699,
};

describe("ComparadorDePrecosSimulado", () => {
  it("gera um preço para cada loja parceira", () => {
    const precos = new ComparadorDePrecosSimulado().comparar(produto);

    expect(precos).toHaveLength(LOJAS_PARCEIRAS.length);
    expect(new Set(precos.map((p) => p.loja)).size).toBe(LOJAS_PARCEIRAS.length);
  });

  it("é determinístico para o mesmo produto", () => {
    const comparador = new ComparadorDePrecosSimulado();

    expect(comparador.comparar(produto)).toEqual(comparador.comparar(produto));
  });

  it("mantém os preços próximos do valor de referência (até ~8%)", () => {
    const precos = new ComparadorDePrecosSimulado().comparar(produto);

    for (const { preco } of precos) {
      expect(preco).toBeGreaterThan(produto.precoReferencia * 0.9);
      expect(preco).toBeLessThan(produto.precoReferencia * 1.1);
    }
  });

  it("ordena do mais barato para o mais caro", () => {
    const precos = new ComparadorDePrecosSimulado().comparar(produto);

    for (let i = 1; i < precos.length; i += 1) {
      expect(precos[i]!.preco).toBeGreaterThanOrEqual(precos[i - 1]!.preco);
    }
  });

  it("trata preço de referência inválido como zero", () => {
    const precos = new ComparadorDePrecosSimulado().comparar({
      ...produto,
      precoReferencia: Number.NaN,
    });

    expect(precos.every((p) => p.preco === 0)).toBe(true);
  });
});
