import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErroDeIntegracaoIA } from "../../src/domain/errors/ErroDeIntegracaoIA.js";

const { generateContent } = vi.hoisted(() => ({
  generateContent: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    public readonly models = { generateContent };
  },
}));

const { GeminiRespostaGenerator } = await import(
  "../../src/infrastructure/ai/GeminiRespostaGenerator.js"
);

const gerador = () =>
  new GeminiRespostaGenerator({
    apiKey: "chave-de-teste",
    modelo: "gemini-teste",
    instrucaoSistema: "Você é o Byte.",
  });

describe("GeminiRespostaGenerator", () => {
  beforeEach(() => {
    generateContent.mockReset();
  });

  it("interpreta o JSON estruturado devolvido pela IA", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        mensagem: " Olá!  ",
        produtos: [
          {
            nome: "Monitor Gamer X",
            categoria: "Monitores",
            descricao: "24 polegadas 165Hz",
            precoReferencia: 1200,
          },
        ],
      }),
    });

    const atendimento = await gerador().gerarAtendimento({
      pergunta: "Tem monitor?",
      historico: [],
    });

    expect(atendimento.mensagem).toBe(" Olá!  ");
    expect(atendimento.produtos).toEqual([
      {
        nome: "Monitor Gamer X",
        categoria: "Monitores",
        descricao: "24 polegadas 165Hz",
        precoReferencia: 1200,
      },
    ]);
  });

  it("monta o conteúdo com histórico e a pergunta atual", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ mensagem: "ok", produtos: [] }),
    });

    await gerador().gerarAtendimento({
      pergunta: "Tem SSD?",
      historico: [
        { papel: "cliente", conteudo: "Oi" },
        { papel: "atendente", conteudo: "Olá!" },
      ],
    });

    const chamada = generateContent.mock.calls[0]?.[0] as {
      contents: unknown;
      config: { responseMimeType: string; responseJsonSchema: unknown; temperature: number };
    };

    expect(chamada.contents).toEqual([
      { role: "user", parts: [{ text: "Oi" }] },
      { role: "model", parts: [{ text: "Olá!" }] },
      { role: "user", parts: [{ text: "Tem SSD?" }] },
    ]);
    expect(chamada.config.responseMimeType).toBe("application/json");
    expect(chamada.config.responseJsonSchema).toBeDefined();
    expect(chamada.config.temperature).toBe(0.6);
  });

  it("descarta produtos inválidos e preenche padrões", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        mensagem: "ok",
        produtos: [
          { nome: 42 },
          { nome: "Produto sem campos", precoReferencia: "caro" },
          "texto solto",
        ],
      }),
    });

    const atendimento = await gerador().gerarAtendimento({ pergunta: "oi", historico: [] });

    expect(atendimento.produtos).toEqual([
      {
        nome: "Produto sem campos",
        categoria: "Tecnologia",
        descricao: "",
        precoReferencia: 0,
      },
    ]);
  });

  it("respeita a temperatura configurada", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ mensagem: "ok", produtos: [] }),
    });
    const comTemperatura = new GeminiRespostaGenerator({
      apiKey: "k",
      modelo: "m",
      instrucaoSistema: "sys",
      temperatura: 1.2,
    });

    await comTemperatura.gerarAtendimento({ pergunta: "oi", historico: [] });

    expect(
      (generateContent.mock.calls[0]?.[0] as { config: { temperature: number } }).config
        .temperature,
    ).toBe(1.2);
  });

  it("lança ErroDeIntegracaoIA quando a IA não retorna conteúdo", async () => {
    generateContent.mockResolvedValue({ text: "   " });

    await expect(gerador().gerarAtendimento({ pergunta: "oi", historico: [] })).rejects.toBeInstanceOf(
      ErroDeIntegracaoIA,
    );
  });

  it("lança ErroDeIntegracaoIA para JSON inválido", async () => {
    generateContent.mockResolvedValue({ text: "isto não é json" });

    await expect(
      gerador().gerarAtendimento({ pergunta: "oi", historico: [] }),
    ).rejects.toThrow(/JSON inválido/);
  });

  it("lança ErroDeIntegracaoIA para atendimento vazio", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ mensagem: "  ", produtos: [] }),
    });

    await expect(
      gerador().gerarAtendimento({ pergunta: "oi", historico: [] }),
    ).rejects.toThrow(/atendimento vazio/);
  });

  it("encapsula falhas do provedor em ErroDeIntegracaoIA", async () => {
    generateContent.mockRejectedValue(new Error("503 UNAVAILABLE"));

    await expect(
      gerador().gerarAtendimento({ pergunta: "oi", historico: [] }),
    ).rejects.toThrow(/Falha ao consultar o provedor de IA.*503/);
  });
});
