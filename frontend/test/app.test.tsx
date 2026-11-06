import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App } from "../src/App.js";

describe("Home da loja", () => {
  it("renderiza a vitrine, os diferenciais e o assistente", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("BytePeças");
    expect(html).toContain("Monte o PC certo");
    expect(html).toContain("Explorar catálogo");
    expect(html).toContain("Peças de verdade");
    expect(html).toContain("Peças para montar do zero");
    expect(html).toContain("Falar com o Byte");
    expect(html).toContain("Não sabe se as peças combinam?");
    expect(html).toContain("Conversa com o atendente Byte");
  });
});