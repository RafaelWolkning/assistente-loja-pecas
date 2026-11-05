import { describe, expect, it } from "vitest";

import { RecuperadorLexical } from "../../src/infrastructure/rag/RecuperadorLexical.js";

const recuperador = new RecuperadorLexical();

describe("RecuperadorLexical", () => {
  it("recupera o documento de monitores para uma pergunta sobre monitor", async () => {
    const trechos = await recuperador.buscar("quero um monitor bom para jogos", 3);

    expect(trechos[0]?.id).toBe("monitores");
  });

  it("recupera o documento de fonte para perguntas de PSU", async () => {
    const trechos = await recuperador.buscar("como dimensionar a fonte do pc", 3);

    expect(trechos.map((t) => t.id)).toContain("fonte-psu");
  });

  it("recupera o documento de compatibilidade para CPU e placa-mãe", async () => {
    const trechos = await recuperador.buscar("o processador ryzen é compatível com qual placa-mãe?", 3);

    expect(trechos.map((t) => t.id)).toContain("compat-cpu-placamae");
  });

  it("retorna lista vazia quando não há termos úteis", async () => {
    expect(await recuperador.buscar("", 3)).toEqual([]);
    expect(await recuperador.buscar("de a o e", 3)).toEqual([]);
  });

  it("respeita o limite de trechos", async () => {
    const trechos = await recuperador.buscar(
      "placa de vídeo memoria processador monitor fonte ssd",
      2,
    );

    expect(trechos.length).toBeLessThanOrEqual(2);
  });
});
