import { describe, expect, it } from "vitest";

import type { Embedador } from "../../src/domain/ports/Embedador.js";
import { RecuperadorVetorial } from "../../src/infrastructure/rag/RecuperadorVetorial.js";

/** Embedder "semântico" simplificado: conta palavras-chave. */
class EmbedadorFake implements Embedador {
  async gerarEmbeddings(textos: string[]): Promise<number[][]> {
    return textos.map((texto) => {
      const alvo = texto.toLowerCase();
      const contar = (palavra: string) => (alvo.match(new RegExp(palavra, "g")) ?? []).length;
      return [contar("monitor"), contar("fonte"), contar("video")];
    });
  }
}

describe("RecuperadorVetorial", () => {
  it("rankeia por similaridade de cosseno", async () => {
    const recuperador = new RecuperadorVetorial(new EmbedadorFake());

    const trechos = await recuperador.buscar("quero um monitor", 3);

    expect(trechos[0]?.id).toBe("monitores");
    expect(trechos[0]!.pontuacao).toBeGreaterThan(0);
  });

  it("retorna vazio quando a consulta não tem termos relevantes", async () => {
    const recuperador = new RecuperadorVetorial(new EmbedadorFake());

    expect(await recuperador.buscar("xyz abc", 3)).toEqual([]);
  });

  it("respeita o limite de trechos", async () => {
    const recuperador = new RecuperadorVetorial(new EmbedadorFake());

    const trechos = await recuperador.buscar("monitor fonte video", 2);

    expect(trechos.length).toBeLessThanOrEqual(2);
  });
});
