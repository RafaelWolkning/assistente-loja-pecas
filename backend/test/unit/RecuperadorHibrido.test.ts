import { describe, expect, it, vi } from "vitest";

import type { TrechoConhecimento } from "../../src/domain/entities/Conhecimento.js";
import type { RecuperadorConhecimento } from "../../src/domain/ports/RecuperadorConhecimento.js";
import { RecuperadorHibrido } from "../../src/infrastructure/rag/RecuperadorHibrido.js";

const trecho: TrechoConhecimento = {
  id: "a",
  titulo: "A",
  conteudo: "conteúdo",
  pontuacao: 1,
};

function fake(impl: () => Promise<TrechoConhecimento[]>): RecuperadorConhecimento {
  return { buscar: vi.fn().mockImplementation(impl) };
}

describe("RecuperadorHibrido", () => {
  it("usa o principal quando ele retorna resultados", async () => {
    const reserva = fake(async () => []);
    const hibrido = new RecuperadorHibrido(fake(async () => [trecho]), reserva);

    const resultado = await hibrido.buscar("consulta", 3);

    expect(resultado).toEqual([trecho]);
    expect(reserva.buscar).not.toHaveBeenCalled();
  });

  it("cai para o reserva quando o principal falha (sem cota)", async () => {
    const reserva = fake(async () => [trecho]);
    const principal = fake(async () => {
      throw new Error("429 quota");
    });
    const hibrido = new RecuperadorHibrido(principal, reserva);

    const resultado = await hibrido.buscar("consulta", 3);

    expect(resultado).toEqual([trecho]);
  });

  it("cai para o reserva quando o principal não acha nada", async () => {
    const reserva = fake(async () => [trecho]);
    const hibrido = new RecuperadorHibrido(fake(async () => []), reserva);

    const resultado = await hibrido.buscar("consulta", 3);

    expect(resultado).toEqual([trecho]);
  });
});
