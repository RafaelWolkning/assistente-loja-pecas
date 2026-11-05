import { montarAplicacao } from "./composition.js";
import { carregarConfig } from "./infrastructure/config/env.js";

/**
 * Ponto de entrada do processo: carrega a configuração, monta a aplicação e
 * sobe o servidor HTTP escutando em 0.0.0.0 (necessário para containers).
 */
async function principal(): Promise<void> {
  const config = carregarConfig();
  const app = montarAplicacao(config);

  try {
    await app.listen({ port: config.porta, host: "0.0.0.0" });
    app.log.info(`BytePeças API online na porta ${config.porta}`);
  } catch (erro) {
    app.log.error(erro);
    process.exit(1);
  }
}

void principal();
