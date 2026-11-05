import { describe, expect, it, vi } from "vitest";

import { PerguntarUseCase } from "../../src/application/usecases/PerguntarUseCase.js";
import { ErroDeValidacao } from "../../src/domain/errors/ErroDeValidacao.js";
import type {
  EntradaAtendimento,
  RespostaGenerator,
} from "../../src/domain/ports/RespostaGenerator.js";

class GeradorFake implements RespostaGenerator {
  public ultimaEntrada: EntradaAtendimento | undefined;

  constructor(private readonly resposta = "Resposta de teste") {}

  async gerarResposta(entrada: EntradaAtendimento): Promise<string> {
    this.ultimaEntrada = entrada;
    return this.resposta;
  }
}

describe("PerguntarUseCase", () => {
  it("remove espaços das bordas da pergunta e da resposta", async () => {
    const gerador = new GeradorFake("   Olá, seja bem-vindo!   ");
    const casoDeUso = new PerguntarUseCase(gerador);

    const resultado = await casoDeUso.executar({ pergunta: "  Quero um SSD  " });

    expect(resultado.resposta).toBe("Olá, seja bem-vindo!");
    expect(gerador.ultimaEntrada?.pergunta).toBe("Quero um SSD");
  });

  it("usa histórico vazio por padrão", async () => {
    const gerador = new GeradorFake();
    const casoDeUso = new PerguntarUseCase(gerador);

    await casoDeUso.executar({ pergunta: "Olá" });

    expect(gerador.ultimaEntrada?.historico).toEqual([]);
  });

  it("repassa o histórico informado ao gerador", async () => {
    const gerador = new GeradorFake();
    const casoDeUso = new PerguntarUseCase(gerador);
    const historico = [{ papel: "cliente" as const, conteudo: "Oi" }];

    await casoDeUso.executar({ pergunta: "E aí?", historico });

    expect(gerador.ultimaEntrada?.historico).toEqual(historico);
  });

  it("lança ErroDeValidacao para pergunta vazia", async () => {
    const casoDeUso = new PerguntarUseCase(new GeradorFake());

    await expect(casoDeUso.executar({ pergunta: "   " })).rejects.toBeInstanceOf(
      ErroDeValidacao,
    );
  });

  it("lança ErroDeValidacao para pergunta acima do limite", async () => {
    const casoDeUso = new PerguntarUseCase(new GeradorFake());

    await expect(
      casoDeUso.executar({ pergunta: "a".repeat(1001) }),
    ).rejects.toThrow(/no máximo 1000 caracteres/);
  });

  it("lança ErroDeValidacao para histórico acima do limite", async () => {
    const casoDeUso = new PerguntarUseCase(new GeradorFake());
    const historico = Array.from({ length: 21 }, () => ({
      papel: "cliente" as const,
      conteudo: "x",
    }));

    await expect(
      casoDeUso.executar({ pergunta: "oi", historico }),
    ).rejects.toThrow(/no máximo 20 mensagens/);
  });

  it("propaga erro lançado pelo gerador", async () => {
    const gerador = {
      gerarResposta: vi.fn().mockRejectedValue(new Error("falha na IA")),
    };
    const casoDeUso = new PerguntarUseCase(gerador);

    await expect(casoDeUso.executar({ pergunta: "oi" })).rejects.toThrow(
      "falha na IA",
    );
  });
});
