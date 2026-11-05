import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErroDeIntegracaoIA } from "../../src/domain/errors/ErroDeIntegracaoIA.js";
import type { EntradaAtendimento } from "../../src/domain/ports/RespostaGenerator.js";

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

  it("responde com o texto da IA (sem espaços nas bordas)", async () => {
    generateContent.mockResolvedValue({ text: "  Olá! Como posso ajudar?  " });

    const resposta = await gerador().gerarResposta({
      pergunta: "Oi",
      historico: [],
    });

    expect(resposta).toBe("Olá! Como posso ajudar?");
  });

  it("monta o conteúdo com histórico e a pergunta atual", async () => {
    generateContent.mockResolvedValue({ text: "ok" });
    const entrada: EntradaAtendimento = {
      pergunta: "Tem SSD?",
      historico: [
        { papel: "cliente", conteudo: "Oi" },
        { papel: "atendente", conteudo: "Olá!" },
      ],
    };

    await gerador().gerarResposta(entrada);

    expect(generateContent).toHaveBeenCalledWith({
      model: "gemini-teste",
      contents: [
        { role: "user", parts: [{ text: "Oi" }] },
        { role: "model", parts: [{ text: "Olá!" }] },
        { role: "user", parts: [{ text: "Tem SSD?" }] },
      ],
      config: {
        systemInstruction: "Você é o Byte.",
        temperature: 0.6,
      },
    });
  });

  it("respeita a temperatura configurada", async () => {
    generateContent.mockResolvedValue({ text: "ok" });
    const comTemperatura = new GeminiRespostaGenerator({
      apiKey: "k",
      modelo: "m",
      instrucaoSistema: "sys",
      temperatura: 1.2,
    });

    await comTemperatura.gerarResposta({ pergunta: "oi", historico: [] });

    expect(generateContent.mock.calls[0]?.[0]?.config.temperature).toBe(1.2);
  });

  it("lança ErroDeIntegracaoIA quando a IA não retorna texto", async () => {
    generateContent.mockResolvedValue({ text: "   " });

    await expect(
      gerador().gerarResposta({ pergunta: "oi", historico: [] }),
    ).rejects.toBeInstanceOf(ErroDeIntegracaoIA);
  });

  it("encapsula falhas do provedor em ErroDeIntegracaoIA", async () => {
    generateContent.mockRejectedValue(new Error("503 UNAVAILABLE"));

    await expect(
      gerador().gerarResposta({ pergunta: "oi", historico: [] }),
    ).rejects.toThrow(/Falha ao consultar o provedor de IA.*503/);
  });
});
