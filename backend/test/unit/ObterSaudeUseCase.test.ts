import { describe, expect, it } from "vitest";

import { ObterSaudeUseCase } from "../../src/application/usecases/ObterSaudeUseCase.js";

describe("ObterSaudeUseCase", () => {
  it("reporta a saúde com valores injetados (determinístico)", () => {
    const data = new Date("2026-11-04T12:00:00.000Z");
    const casoDeUso = new ObterSaudeUseCase({
      modelo: "gemini-3.5-flash-lite",
      versao: "9.9.9",
      obterUptime: () => 42.6,
      agora: () => data,
    });

    expect(casoDeUso.executar()).toEqual({
      status: "ok",
      uptimeSegundos: 43,
      versao: "9.9.9",
      modelo: "gemini-3.5-flash-lite",
      dataHora: "2026-11-04T12:00:00.000Z",
    });
  });
});
