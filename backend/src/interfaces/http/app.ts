import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";

import { ErroDeIntegracaoIA } from "../../domain/errors/ErroDeIntegracaoIA.js";
import { ErroDeValidacao } from "../../domain/errors/ErroDeValidacao.js";
import type { ListarProdutosUseCase } from "../../application/usecases/ListarProdutosUseCase.js";
import type { ObterSaudeUseCase } from "../../application/usecases/ObterSaudeUseCase.js";
import type { PerguntarUseCase } from "../../application/usecases/PerguntarUseCase.js";
import { registrarRotas } from "./routes/index.js";

/** Dependências já resolvidas que a camada HTTP precisa para funcionar. */
export interface DependenciasApp {
  perguntar: PerguntarUseCase;
  saude: ObterSaudeUseCase;
  listarProdutos: ListarProdutosUseCase;
  corsOrigem: string | string[];
  logLevel: string;
}

/**
 * Composition root da camada HTTP: cria o servidor Fastify, registra CORS,
 * tratamento de erros e as rotas. Recebe casos de uso prontos — não instancia
 * nada de infraestrutura, o que mantém os testes desacoplados.
 */
export function construirApp(deps: DependenciasApp): FastifyInstance {
  const app = Fastify({ logger: { level: deps.logLevel } });

  app.register(cors, { origin: deps.corsOrigem });

  app.setErrorHandler((erro: unknown, _req, reply) => {
    if (erro instanceof ErroDeValidacao) {
      return reply.status(400).send({ erro: erro.message });
    }

    if (erro instanceof ErroDeIntegracaoIA) {
      app.log.error(erro);
      return reply.status(503).send({
        erro: "O atendente de IA está indisponível no momento. Tente novamente em instantes.",
      });
    }

    const detalhe = erro as { validation?: unknown; message?: string };
    if (detalhe.validation) {
      return reply
        .status(400)
        .send({ erro: "Dados de entrada inválidos.", detalhes: detalhe.message });
    }

    app.log.error(erro);
    return reply.status(500).send({ erro: "Erro interno do servidor." });
  });

  app.setNotFoundHandler((_req, reply) =>
    reply.status(404).send({ erro: "Rota não encontrada." }),
  );

  registrarRotas(app, deps);

  return app;
}
