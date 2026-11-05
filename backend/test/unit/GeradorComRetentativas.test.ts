import { describe, expect, it, vi } from "vitest";

import { GeradorComRetentativas } from "../../src/infrastructure/ai/GeradorComRetentativas.js";
import type { EntradaAtendimento } from "../../src/domain/ports/RespostaGenerator.js";

const entrada: EntradaAtendimento = { pergunta: "oi", historico: [] };

describe("GeradorComRetentativas", () => {
  it("não retenta quando a primeira tentativa funciona", async () => {
    const delegate = { gerarResposta: vi.fn().mockResolvedValue("ok") };
    const esperar = vi.fn();
    const gerador = new GeradorComRetentativas(delegate, {
      tentativas: 3,
      atrasoBaseMs: 100,
      esperar,
    });

    await expect(gerador.gerarResposta(entrada)).resolves.toBe("ok");
    expect(delegate.gerarResposta).toHaveBeenCalledTimes(1);
    expect(esperar).not.toHaveBeenCalled();
  });

  it("retenta erro transitório e retorna no primeiro sucesso", async () => {
    const delegate = {
      gerarResposta: vi
        .fn()
        .mockRejectedValueOnce(new Error("503 high demand"))
        .mockResolvedValueOnce("ok"),
    };
    const esperar = vi.fn().mockResolvedValue(undefined);
    const gerador = new GeradorComRetentativas(delegate, {
      tentativas: 3,
      atrasoBaseMs: 500,
      esperar,
    });

    await expect(gerador.gerarResposta(entrada)).resolves.toBe("ok");
    expect(delegate.gerarResposta).toHaveBeenCalledTimes(2);
    expect(esperar).toHaveBeenCalledWith(500);
  });

  it("aplica backoff exponencial entre as tentativas", async () => {
    const delegate = {
      gerarResposta: vi.fn().mockRejectedValue(new Error("503")),
    };
    const esperar = vi.fn().mockResolvedValue(undefined);
    const gerador = new GeradorComRetentativas(delegate, {
      tentativas: 3,
      atrasoBaseMs: 100,
      esperar,
    });

    await expect(gerador.gerarResposta(entrada)).rejects.toThrow("503");
    expect(esperar).toHaveBeenNthCalledWith(1, 100);
    expect(esperar).toHaveBeenNthCalledWith(2, 200);
  });

  it("não retenta erro permanente", async () => {
    const delegate = {
      gerarResposta: vi.fn().mockRejectedValue(new Error("400 bad request")),
    };
    const esperar = vi.fn();
    const gerador = new GeradorComRetentativas(delegate, {
      tentativas: 3,
      atrasoBaseMs: 10,
      esperar,
    });

    await expect(gerador.gerarResposta(entrada)).rejects.toThrow("400");
    expect(delegate.gerarResposta).toHaveBeenCalledTimes(1);
    expect(esperar).not.toHaveBeenCalled();
  });

  it("converte erro que não é Error em Error", async () => {
    const delegate = { gerarResposta: vi.fn().mockRejectedValue("falha texto") };
    const gerador = new GeradorComRetentativas(delegate, {
      tentativas: 1,
      atrasoBaseMs: 1,
      esperar: vi.fn(),
    });

    await expect(gerador.gerarResposta(entrada)).rejects.toThrow("falha texto");
  });
});
