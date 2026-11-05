import { describe, expect, it } from "vitest";

import { construirPromptSistema } from "../../src/infrastructure/ai/promptSistema.js";
import { PRODUTOS_PADRAO } from "../../src/infrastructure/catalog/CatalogoEmMemoria.js";

describe("construirPromptSistema", () => {
  it("inclui a persona, as regras e o catálogo formatado", () => {
    const prompt = construirPromptSistema(PRODUTOS_PADRAO);

    expect(prompt).toContain("Byte");
    expect(prompt).toContain("BytePeças");
    expect(prompt).toContain("português do Brasil");
    expect(prompt).toContain("Ryzen 7 7800X3D");
    expect(prompt).toContain("R$ 2499.90");
    expect(prompt).toContain("12 un. em estoque");
    expect(prompt).toContain("não use formatação markdown");
  });

  it("funciona com um catálogo vazio", () => {
    const prompt = construirPromptSistema([]);

    expect(prompt).toContain("Catálogo de produtos:");
  });
});
