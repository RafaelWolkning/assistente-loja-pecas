import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Produto, ProdutoComPrecos } from "../src/api/client.js";
import { CartaoCatalogo } from "../src/components/CartaoCatalogo.js";
import { CartaoProduto } from "../src/components/CartaoProduto.js";
import { formatarBRL } from "../src/utils/formato.js";

const produto: Produto = {
  id: "gpu-1",
  nome: "Placa de vídeo NVIDIA RTX 4070 Super 12GB",
  categoria: "Placas de vídeo",
  preco: 4299,
  descricao: "Ray tracing e DLSS 3 para 1440p.",
  estoque: 5,
};

const produtoComPrecos: ProdutoComPrecos = {
  nome: "Monitor Gamer Samsung Odyssey G5",
  categoria: "Monitores",
  descricao: "27 polegadas 165Hz",
  precoReferencia: 1699,
  origemPreco: "catalogo",
  precos: [
    { loja: "Hardware Prime", preco: 1632.67 },
    { loja: "BytePeças", preco: 1669.37 },
  ],
};

describe("Cards de produto", () => {
  it("formata valores em reais", () => {
    expect(formatarBRL(2499.9)).toContain("2.499,90");
    expect(formatarBRL(0)).toContain("0,00");
  });

  it("renderiza o card da vitrine com preço, parcela e estoque baixo", () => {
    const html = renderToStaticMarkup(
      <CartaoCatalogo produto={produto} aoPerguntar={() => undefined} />,
    );

    expect(html).toContain("Placa de vídeo NVIDIA RTX 4070 Super 12GB");
    expect(html).toContain("Placas de vídeo");
    expect(html).toContain("Últimas 5 un.");
    expect(html).toContain("Perguntar ao Byte");
    expect(html).toContain("12x de");
    expect(html).toContain("4.299,00");
  });

  it("marca o melhor preço na tabela do atendimento", () => {
    const html = renderToStaticMarkup(<CartaoProduto produto={produtoComPrecos} />);

    expect(html).toContain("Monitor Gamer Samsung Odyssey G5");
    expect(html).toContain("Hardware Prime");
    expect(html).toContain("melhor preço");
    expect(html).toContain("Preço de catálogo BytePeças");
  });
});