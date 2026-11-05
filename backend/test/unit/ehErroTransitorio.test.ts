import { describe, expect, it } from "vitest";

import { ehErroTransitorio } from "../../src/infrastructure/ai/ehErroTransitorio.js";

describe("ehErroTransitorio", () => {
  it("considera transitórios os erros de sobrecarga/quota", () => {
    expect(ehErroTransitorio(new Error("ApiError: 503 UNAVAILABLE"))).toBe(true);
    expect(ehErroTransitorio(new Error("code 429: RESOURCE_EXHAUSTED"))).toBe(
      true,
    );
    expect(ehErroTransitorio(new Error("This model is experiencing high demand"))).toBe(
      true,
    );
    expect(ehErroTransitorio(new Error("connect ETIMEDOUT"))).toBe(true);
  });

  it("considera permanentes os erros de cliente", () => {
    expect(ehErroTransitorio(new Error("400 Bad Request"))).toBe(false);
    expect(ehErroTransitorio(new Error("401 Unauthorized"))).toBe(false);
    expect(ehErroTransitorio(new Error("403 Forbidden"))).toBe(false);
    expect(ehErroTransitorio(new Error("404 model not found"))).toBe(false);
    expect(ehErroTransitorio(new Error("Algo inesperado"))).toBe(false);
  });

  it("aceita valores que não são Error", () => {
    expect(ehErroTransitorio("falha 503 temporária")).toBe(true);
    expect(ehErroTransitorio("falha desconhecida")).toBe(false);
  });
});
