import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErroDeIntegracaoIA } from "../../src/domain/errors/ErroDeIntegracaoIA.js";

const { embedContent } = vi.hoisted(() => ({
  embedContent: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    public readonly models = { embedContent };
  },
}));

const { EmbedadorGemini } = await import("../../src/infrastructure/rag/EmbedadorGemini.js");

const embedador = () =>
  new EmbedadorGemini({ apiKey: "chave", modelo: "gemini-embedding-001" });

describe("EmbedadorGemini", () => {
  beforeEach(() => {
    embedContent.mockReset();
  });

  it("devolve os vetores retornados pelo SDK", async () => {
    embedContent.mockResolvedValue({
      embeddings: [{ values: [0.1, 0.2] }, { values: [0.3, 0.4] }],
    });

    const vetores = await embedador().gerarEmbeddings(["a", "b"]);

    expect(vetores).toEqual([
      [0.1, 0.2],
      [0.3, 0.4],
    ]);
    expect(embedContent).toHaveBeenCalledWith({ model: "gemini-embedding-001", contents: ["a", "b"] });
  });

  it("não chama a API para lista vazia", async () => {
    expect(await embedador().gerarEmbeddings([])).toEqual([]);
    expect(embedContent).not.toHaveBeenCalled();
  });

  it("trata embeddings ausentes como vetores vazios", async () => {
    embedContent.mockResolvedValue({});

    expect(await embedador().gerarEmbeddings(["a"])).toEqual([]);
  });

  it("encapsula falhas em ErroDeIntegracaoIA", async () => {
    embedContent.mockRejectedValue(new Error("429 quota"));

    await expect(embedador().gerarEmbeddings(["a"])).rejects.toBeInstanceOf(ErroDeIntegracaoIA);
  });
});
