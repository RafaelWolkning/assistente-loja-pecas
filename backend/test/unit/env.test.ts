import { describe, expect, it } from "vitest";

import {
  ATRASO_BASE_PADRAO_MS,
  carregarConfig,
  MODELO_PADRAO,
  PORTA_PADRAO,
  TENTATIVAS_PADRAO,
  VERSAO_PADRAO,
} from "../../src/infrastructure/config/env.js";

describe("carregarConfig", () => {
  it("exige GEMINI_API_KEY", () => {
    expect(() => carregarConfig({})).toThrow(/GEMINI_API_KEY/);
    expect(() => carregarConfig({ GEMINI_API_KEY: "   " })).toThrow(
      /GEMINI_API_KEY/,
    );
  });

  it("aplica os valores padrão", () => {
    const config = carregarConfig({ GEMINI_API_KEY: "chave" });

    expect(config.geminiModelo).toBe(MODELO_PADRAO);
    expect(config.porta).toBe(PORTA_PADRAO);
    expect(config.corsOrigem).toBe("*");
    expect(config.logLevel).toBe("info");
    expect(config.versao).toBe(VERSAO_PADRAO);
    expect(config.tentativasIA).toBe(TENTATIVAS_PADRAO);
    expect(config.atrasoBaseMs).toBe(ATRASO_BASE_PADRAO_MS);
    expect(config.usarBuscaWeb).toBe(true);
    expect(config.ragHabilitado).toBe(true);
    expect(config.ragTopK).toBe(4);
    expect(config.embedModelo).toBe("gemini-embedding-001");
  });

  it("faz parse de uma lista de origens CORS", () => {
    const config = carregarConfig({
      GEMINI_API_KEY: "chave",
      CORS_ORIGIN: "https://a.com, https://b.com",
    });

    expect(config.corsOrigem).toEqual(["https://a.com", "https://b.com"]);
  });

  it("rejeita PORT inválido", () => {
    for (const porta of ["abc", "0", "-3", "70000"]) {
      expect(() =>
        carregarConfig({ GEMINI_API_KEY: "chave", PORT: porta }),
      ).toThrow(/PORT/);
    }
  });

  it("rejeita parâmetros de retentativa inválidos", () => {
    expect(() =>
      carregarConfig({ GEMINI_API_KEY: "chave", IA_TENTATIVAS: "-1" }),
    ).toThrow(/IA_TENTATIVAS/);
    expect(() =>
      carregarConfig({ GEMINI_API_KEY: "chave", IA_ATRASO_BASE_MS: "x" }),
    ).toThrow(/IA_ATRASO_BASE_MS/);
  });

  it("respeita valores customizados", () => {
    const config = carregarConfig({
      GEMINI_API_KEY: "chave",
      GEMINI_MODEL: "gemini-x",
      PORT: "8080",
      LOG_LEVEL: "debug",
      APP_VERSION: "2.0.0",
      IA_TENTATIVAS: "5",
      IA_ATRASO_BASE_MS: "100",
      USAR_BUSCA_WEB: "false",
      RAG_HABILITADO: "no",
      RAG_TOP_K: "6",
      EMBED_MODEL: "gemini-embedding-2",
    });

    expect(config).toMatchObject({
      geminiModelo: "gemini-x",
      porta: 8080,
      logLevel: "debug",
      versao: "2.0.0",
      tentativasIA: 5,
      atrasoBaseMs: 100,
      usarBuscaWeb: false,
      ragHabilitado: false,
      ragTopK: 6,
      embedModelo: "gemini-embedding-2",
    });
  });

  it("aceita variações de booleanos", () => {
    expect(carregarConfig({ GEMINI_API_KEY: "k", USAR_BUSCA_WEB: "1" }).usarBuscaWeb).toBe(true);
    expect(carregarConfig({ GEMINI_API_KEY: "k", USAR_BUSCA_WEB: "sim" }).usarBuscaWeb).toBe(true);
    expect(carregarConfig({ GEMINI_API_KEY: "k", USAR_BUSCA_WEB: "off" }).usarBuscaWeb).toBe(false);
  });
});
