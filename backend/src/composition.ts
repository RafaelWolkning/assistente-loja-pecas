import type { FastifyInstance } from "fastify";

import { ListarProdutosUseCase } from "./application/usecases/ListarProdutosUseCase.js";
import { ObterSaudeUseCase } from "./application/usecases/ObterSaudeUseCase.js";
import { PerguntarUseCase } from "./application/usecases/PerguntarUseCase.js";
import type { CatalogoProdutos } from "./domain/ports/CatalogoProdutos.js";
import type { ComparadorDePrecos } from "./domain/ports/ComparadorDePrecos.js";
import type { RespostaGenerator } from "./domain/ports/RespostaGenerator.js";
import { GeminiRespostaGenerator } from "./infrastructure/ai/GeminiRespostaGenerator.js";
import { GeradorComRetentativas } from "./infrastructure/ai/GeradorComRetentativas.js";
import { construirPromptSistema } from "./infrastructure/ai/promptSistema.js";
import { CatalogoEmMemoria } from "./infrastructure/catalog/CatalogoEmMemoria.js";
import type { Config } from "./infrastructure/config/env.js";
import { ComparadorDePrecosSimulado } from "./infrastructure/precos/ComparadorDePrecosSimulado.js";
import { construirApp } from "./interfaces/http/app.js";

/** Pontos de substituição usados pelos testes (injeção de dependência). */
export interface OverridesComposicao {
  gerador?: RespostaGenerator;
  catalogo?: CatalogoProdutos;
  comparador?: ComparadorDePrecos;
  obterUptime?: () => number;
  agora?: () => Date;
}

/**
 * Composition root da aplicação: liga infraestrutura (adapters) aos casos de
 * uso e entrega o servidor HTTP pronto. É o único ponto que "monta o grafo".
 */
export function montarAplicacao(
  config: Config,
  overrides: OverridesComposicao = {},
): FastifyInstance {
  const catalogo = overrides.catalogo ?? new CatalogoEmMemoria();

  const gerador: RespostaGenerator =
    overrides.gerador ??
    new GeradorComRetentativas(
      new GeminiRespostaGenerator({
        apiKey: config.geminiApiKey,
        modelo: config.geminiModelo,
        instrucaoSistema: construirPromptSistema(catalogo.listar()),
      }),
      { tentativas: config.tentativasIA, atrasoBaseMs: config.atrasoBaseMs },
    );

  const comparador = overrides.comparador ?? new ComparadorDePrecosSimulado();

  const perguntar = new PerguntarUseCase(gerador, comparador, catalogo);
  const saude = new ObterSaudeUseCase({
    modelo: config.geminiModelo,
    versao: config.versao,
    obterUptime: overrides.obterUptime ?? (() => process.uptime()),
    agora: overrides.agora ?? (() => new Date()),
  });
  const listarProdutos = new ListarProdutosUseCase(catalogo);

  return construirApp({
    perguntar,
    saude,
    listarProdutos,
    corsOrigem: config.corsOrigem,
    logLevel: config.logLevel,
  });
}
