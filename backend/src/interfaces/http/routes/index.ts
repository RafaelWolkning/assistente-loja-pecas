import type { FastifyInstance } from "fastify";

import type { DependenciasApp } from "../app.js";
import { registrarRotaPerguntar } from "./perguntar.js";
import { registrarRotaProdutos } from "./produtos.js";
import { registrarRotaSaude } from "./saude.js";

/**
 * Registra todas as rotas da API.
 *
 * Endpoints:
 *   GET  /          -> metadados da API
 *   GET  /saude     -> saúde/status
 *   GET  /produtos  -> catálogo da loja
 *   POST /perguntar -> pergunta ao atendente de IA
 */
export function registrarRotas(app: FastifyInstance, deps: DependenciasApp): void {
  app.get("/", async (_requisicao, resposta) =>
    resposta.status(200).send({
      nome: "BytePeças — API do assistente de atendimento",
      endpoints: {
        saude: "GET /saude",
        produtos: "GET /produtos",
        perguntar: "POST /perguntar",
      },
    }),
  );

  registrarRotaSaude(app, deps.saude);
  registrarRotaProdutos(app, deps.listarProdutos);
  registrarRotaPerguntar(app, deps.perguntar);
}
