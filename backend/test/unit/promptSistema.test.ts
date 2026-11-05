import { describe, expect, it } from "vitest";

import { construirPromptSistema } from "../../src/infrastructure/ai/promptSistema.js";
import { PRODUTOS_PADRAO } from "../../src/infrastructure/catalog/CatalogoEmMemoria.js";

describe("construirPromptSistema", () => {
  it("inclui a persona, o conhecimento amplo e o catálogo formatado", () => {
    const prompt = construirPromptSistema(PRODUTOS_PADRAO);

    expect(prompt).toContain("Byte");
    expect(prompt).toContain("BytePeças");
    expect(prompt).toContain("TODA tecnologia");
    expect(prompt).toContain("português do Brasil");
    expect(prompt).toContain("Ryzen 7 7800X3D");
    expect(prompt).toContain("R$ 2499.90");
    expect(prompt).toContain("12 un. em estoque");
  });

  it("instrui a formatar a mensagem e a não escrever preços nem markdown", () => {
    const prompt = construirPromptSistema(PRODUTOS_PADRAO);

    expect(prompt).toContain("PARÁGRAFOS CURTOS");
    expect(prompt).toContain("formatação markdown");
    expect(prompt).toContain("NÃO escreva preços");
  });

  it("funciona com um catálogo vazio", () => {
    const prompt = construirPromptSistema([]);

    expect(prompt).toContain("Catálogo da BytePeças");
  });
});
