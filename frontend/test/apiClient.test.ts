import { afterEach, describe, expect, it, vi } from "vitest";

import { listarProdutos, perguntar } from "../src/api/client.js";

function respostaJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cliente da API", () => {
  it("lista os produtos do catálogo", async () => {
    const buscar = vi.fn().mockResolvedValue(
      respostaJson({
        produtos: [
          {
            id: "ssd-1",
            nome: "SSD NVMe 1TB",
            categoria: "Armazenamento",
            preco: 449.9,
            descricao: "PCIe 4.0",
            estoque: 30,
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", buscar);

    const resposta = await listarProdutos();

    expect(buscar).toHaveBeenCalledOnce();
    expect(resposta.produtos[0]!.nome).toBe("SSD NVMe 1TB");
  });

  it("tolera a resposta nova (mensagem + produtos)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respostaJson({
          mensagem: "Separei estas peças.",
          produtos: [
            {
              nome: "SSD",
              categoria: "Armazenamento",
              descricao: "rápido",
              precoReferencia: 400,
              origemPreco: "catalogo",
              precos: [{ loja: "BytePeças", preco: 399 }],
            },
          ],
          foraDeEscopo: false,
          fontesWeb: [{ titulo: "Fonte", url: "https://exemplo.com" }],
          conhecimento: ["Armazenamento"],
        }),
      ),
    );

    const resposta = await perguntar("Quero um SSD", []);

    expect(resposta.mensagem).toBe("Separei estas peças.");
    expect(resposta.produtos).toHaveLength(1);
    expect(resposta.fontesWeb[0]!.url).toBe("https://exemplo.com");
    expect(resposta.conhecimento).toEqual(["Armazenamento"]);
  });

  it("tolera a resposta antiga da API (campo resposta)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respostaJson({ resposta: "Resposta legada" })),
    );

    const resposta = await perguntar("Oi", []);

    expect(resposta.mensagem).toBe("Resposta legada");
    expect(resposta.produtos).toEqual([]);
    expect(resposta.foraDeEscopo).toBe(false);
  });

  it("propaga a mensagem de erro devolvida pela API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respostaJson({ erro: "Provedor indisponível." }, 503)),
    );

    await expect(perguntar("Oi", [])).rejects.toThrow("Provedor indisponível.");
  });
});