import type { FastifyInstance } from "fastify";

import type { ListarProdutosUseCase } from "../../../application/usecases/ListarProdutosUseCase.js";

export function registrarRotaProdutos(
  app: FastifyInstance,
  casoDeUso: ListarProdutosUseCase,
): void {
  app.get("/produtos", async (_requisicao, resposta) => {
    return resposta.status(200).send({ produtos: casoDeUso.executar() });
  });
}
