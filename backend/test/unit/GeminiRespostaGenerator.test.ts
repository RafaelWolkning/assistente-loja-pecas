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

const gerador = (usarBuscaWeb = false) =>
  new GeminiRespostaGenerator({
    apiKey: "chave-de-teste",
    modelo: "gemini-teste",
    instrucaoSistema: "Você é o Byte.",
    usarBuscaWeb,
  });

const respostaJson = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    assuntoDeTecnologia: true,
    mensagem: "ok",
    produtos: [],
    ...extra,
  });

describe("GeminiRespostaGenerator", () => {
  beforeEach(() => {
    generateContent.mockReset();
  });

  it("interpreta o JSON estruturado devolvido pela IA", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        assuntoDeTecnologia: true,
        mensagem: " Olá!  ",
        produtos: [
          { nome: "Monitor Gamer X", categoria: "Monitores", descricao: "165Hz", precoReferencia: 1200 },
        ],
      }),
    });

    const atendimento = await gerador().gerarAtendimento({ pergunta: "Tem monitor?", historico: [] });

    expect(atendimento.assuntoDeTecnologia).toBe(true);
    expect(atendimento.produtos).toEqual([
      { nome: "Monitor Gamer X", categoria: "Monitores", descricao: "165Hz", precoReferencia: 1200 },
    ]);
    expect(atendimento.fontesWeb).toEqual([]);
  });

  it("interpreta assuntoDeTecnologia = false (fora de escopo)", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ assuntoDeTecnologia: false, mensagem: "Só tecnologia.", produtos: [] }),
    });

    const atendimento = await gerador().gerarAtendimento({ pergunta: "Peça de carro?", historico: [] });

    expect(atendimento.assuntoDeTecnologia).toBe(false);
  });

  it("monta o conteúdo e injeta o conhecimento (RAG) na instrução", async () => {
    generateContent.mockResolvedValue({ text: respostaJson() });

    await gerador().gerarAtendimento({
      pergunta: "Tem SSD?",
      historico: [{ papel: "cliente", conteudo: "Oi" }],
      conhecimento: [{ id: "a", titulo: "Armazenamento", conteudo: "SSD NVMe é rápido", pontuacao: 2 }],
    });

    const chamada = generateContent.mock.calls[0]?.[0] as {
      contents: unknown;
      config: { systemInstruction: string; responseMimeType: string; tools?: unknown };
    };

    expect(chamada.contents).toEqual([
      { role: "user", parts: [{ text: "Oi" }] },
      { role: "user", parts: [{ text: "Tem SSD?" }] },
    ]);
    expect(chamada.config.systemInstruction).toContain("Base de conhecimento técnico");
    expect(chamada.config.systemInstruction).toContain("SSD NVMe é rápido");
    expect(chamada.config.responseMimeType).toBe("application/json");
    expect(chamada.config.tools).toBeUndefined();
  });

  it("habilita a busca do Google e extrai as fontes quando usarBuscaWeb = true", async () => {
    generateContent.mockResolvedValue({
      text: respostaJson(),
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: "https://a.com", title: "A" } },
              { web: { uri: "https://a.com", title: "A duplicado" } },
              { web: { uri: "https://b.com" } },
            ],
          },
        },
      ],
    });

    const atendimento = await gerador(true).gerarAtendimento({ pergunta: "oi", historico: [] });

    const chamada = generateContent.mock.calls[0]?.[0] as { config: { tools?: unknown } };
    expect(chamada.config.tools).toEqual([{ googleSearch: {} }]);
    expect(atendimento.fontesWeb).toEqual([
      { titulo: "A", url: "https://a.com" },
      { titulo: "https://b.com", url: "https://b.com" },
    ]);
  });

  it("desliga a busca e tenta de novo quando a primeira chamada falha", async () => {
    generateContent
      .mockRejectedValueOnce(new Error("400 tool googleSearch not supported"))
      .mockResolvedValueOnce({ text: respostaJson() });

    const atendimento = await gerador(true).gerarAtendimento({ pergunta: "oi", historico: [] });

    expect(atendimento.mensagem).toBe("ok");
    expect(generateContent).toHaveBeenCalledTimes(2);
    const primeira = generateContent.mock.calls[0]?.[0] as { config: { tools?: unknown } };
    const segunda = generateContent.mock.calls[1]?.[0] as { config: { tools?: unknown } };
    expect(primeira.config.tools).toEqual([{ googleSearch: {} }]);
    expect(segunda.config.tools).toBeUndefined();
  });

  it("descarta produtos inválidos e preenche padrões", async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        assuntoDeTecnologia: true,
        mensagem: "ok",
        produtos: [{ nome: 42 }, { nome: "Sem campos", precoReferencia: "caro" }, "texto"],
      }),
    });

    const atendimento = await gerador().gerarAtendimento({ pergunta: "oi", historico: [] });

    expect(atendimento.produtos).toEqual([
      { nome: "Sem campos", categoria: "Tecnologia", descricao: "", precoReferencia: 0 },
    ]);
  });

  it("lança ErroDeIntegracaoIA quando a IA não retorna conteúdo", async () => {
    generateContent.mockResolvedValue({ text: "   " });

    await expect(gerador().gerarAtendimento({ pergunta: "oi", historico: [] })).rejects.toBeInstanceOf(
      ErroDeIntegracaoIA,
    );
  });

  it("lança ErroDeIntegracaoIA para JSON inválido", async () => {
    generateContent.mockResolvedValue({ text: "isto não é json" });

    await expect(gerador().gerarAtendimento({ pergunta: "oi", historico: [] })).rejects.toThrow(
      /JSON inválido/,
    );
  });

  it("encapsula falhas do provedor em ErroDeIntegracaoIA", async () => {
    generateContent.mockRejectedValue(new Error("503 UNAVAILABLE"));

    await expect(gerador().gerarAtendimento({ pergunta: "oi", historico: [] })).rejects.toThrow(
      /Falha ao consultar o provedor de IA.*503/,
    );
  });
});
