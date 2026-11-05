import type { FastifyInstance } from "fastify";

import type { ObterSaudeUseCase } from "../../../application/usecases/ObterSaudeUseCase.js";

export function registrarRotaSaude(
  app: FastifyInstance,
  casoDeUso: ObterSaudeUseCase,
): void {
  app.get("/saude", async (_requisicao, resposta) => {
    return resposta.status(200).send(casoDeUso.executar());
  });
}
