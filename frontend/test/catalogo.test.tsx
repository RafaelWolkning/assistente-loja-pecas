import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Produto } from "../src/api/client.js";
import {
  Catalogo,
  categoriasDisponiveis,
  filtrarProdutos,
  normalizar,
} from "../src/components/Catalogo.js";

const produtos: Produto[] = [
  {
    id: "cpu-1",
    nome: "Processador AMD Ryzen 7 7800X3D",
    categoria: "Processadores",
    preco: 2499.9,
    descricao: "8 núcleos para jogos",
    estoque: 12,
  },
  {
    id: "gpu-1",
    nome: "Placa de vídeo NVIDIA RTX 4070 Super 12GB",
    categoria: "Placas de vídeo",
    preco: 4299,
    descricao: "Ray tracing em 1440p",
    estoque: 5,
  },
  {
    id: "ram-1",
    nome: "Memória Kingston Fury DDR5 32GB",
    categoria: "Memórias",
    preco: 899.9,
    descricao: "Kit dual-channel 6000MHz",
    estoque: 20,
  },
];

describe("Catálogo (home da loja)", () => {
  it("normaliza acentos e caixa para a busca", () => {
    expect(normalizar("Memória")).toBe("memoria");
    expect(normalizar("PLACA DE VÍDEO")).toBe("placa de video");
  });

  it("filtra por categoria", () => {
    const resultado = filtrarProdutos(produtos, "Placas de vídeo", "");

    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.id).toBe("gpu-1");
  });

  it("filtra por busca livre sem diferenciar acentos", () => {
    expect(filtrarProdutos(produtos, "Todas", "memoria")[0]!.id).toBe("ram-1");
    expect(filtrarProdutos(produtos, "Todas", "rtx 4070")[0]!.id).toBe("gpu-1");
  });

  it("conta as categorias na ordem em que aparecem", () => {
    expect(categoriasDisponiveis(produtos)).toEqual([
      { nome: "Processadores", total: 1 },
      { nome: "Placas de vídeo", total: 1 },
      { nome: "Memórias", total: 1 },
    ]);
  });

  it("renderiza os cards da vitrine com nome, preço e categoria", () => {
    const html = renderToStaticMarkup(
      <Catalogo
        produtos={produtos}
        carregando={false}
        erro={null}
        aoRecarregar={() => undefined}
        aoPerguntar={() => undefined}
      />,
    );

    expect(html).toContain("Peças para montar do zero");
    expect(html).toContain("3 peças encontradas");
    expect(html).toContain("Processador AMD Ryzen 7 7800X3D");
    expect(html).toContain("Placa de vídeo NVIDIA RTX 4070 Super 12GB");
    expect(html).toContain("R$");
    expect(html).toContain("Perguntar ao Byte");
  });

  it("mostra estado vazio quando não há peças", () => {
    const html = renderToStaticMarkup(
      <Catalogo
        produtos={[]}
        carregando={false}
        erro={null}
        aoRecarregar={() => undefined}
        aoPerguntar={() => undefined}
      />,
    );

    expect(html).toContain("Nenhuma peça encontrada");
    expect(html).toContain("Limpar filtros");
  });

  it("mostra o esqueleto enquanto carrega", () => {
    const html = renderToStaticMarkup(
      <Catalogo
        produtos={[]}
        carregando
        erro={null}
        aoRecarregar={() => undefined}
        aoPerguntar={() => undefined}
      />,
    );

    expect(html).toContain("Carregando catálogo");
    expect(html).toContain("esqueleto__midia");
  });
});