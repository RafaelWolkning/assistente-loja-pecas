import type {
  EntradaAtendimento,
  RespostaGenerator,
} from "../../domain/ports/RespostaGenerator.js";
import { ehErroTransitorio } from "./ehErroTransitorio.js";

export interface OpcoesRetentativa {
  /** Número total de tentativas (inclui a primeira). */
  tentativas: number;
  /** Atraso base em ms; cresce exponencialmente a cada tentativa. */
  atrasoBaseMs: number;
  /** Injetável para testes (evita esperas reais). */
  esperar?: (ms: number) => Promise<void>;
}

const esperarPadrao = (ms: number): Promise<void> =>
  new Promise((resolver) => setTimeout(resolver, ms));

/**
 * Decorador de `RespostaGenerator` que adiciona retentativas com backoff
 * exponencial para erros transitórios (429/503 do Gemini, comuns no free
 * tier). Mantém a responsabilidade isolada do adaptador concreto.
 */
export class GeradorComRetentativas implements RespostaGenerator {
  constructor(
    private readonly delegate: RespostaGenerator,
    private readonly opcoes: OpcoesRetentativa,
  ) {}

  async gerarResposta(entrada: EntradaAtendimento): Promise<string> {
    const esperar = this.opcoes.esperar ?? esperarPadrao;
    let ultimoErro: unknown;

    for (let tentativa = 1; tentativa <= this.opcoes.tentativas; tentativa += 1) {
      try {
        return await this.delegate.gerarResposta(entrada);
      } catch (erro) {
        ultimoErro = erro;
        const ultimaTentativa = tentativa === this.opcoes.tentativas;
        if (!ehErroTransitorio(erro) || ultimaTentativa) {
          break;
        }
        await esperar(this.opcoes.atrasoBaseMs * 2 ** (tentativa - 1));
      }
    }

    throw ultimoErro instanceof Error
      ? ultimoErro
      : new Error(String(ultimoErro));
  }
}
