import { ErroDeValidacao } from "../../domain/errors/ErroDeValidacao.js";
import type { Mensagem } from "../../domain/entities/Mensagem.js";
import type { RespostaGenerator } from "../../domain/ports/RespostaGenerator.js";

export const TAMANHO_MAXIMO_PERGUNTA = 1000;
export const TAMANHO_MAXIMO_HISTORICO = 20;

export interface EntradaPerguntar {
  pergunta: string;
  historico?: Mensagem[];
}

export interface SaidaPerguntar {
  resposta: string;
}

/**
 * Caso de uso: receber a pergunta do cliente, validar e delegar a geração
 * da resposta ao gerador de IA (porta). Não conhece HTTP nem Gemini.
 */
export class PerguntarUseCase {
  constructor(private readonly gerador: RespostaGenerator) {}

  async executar(entrada: EntradaPerguntar): Promise<SaidaPerguntar> {
    const pergunta = (entrada.pergunta ?? "").trim();

    if (pergunta.length === 0) {
      throw new ErroDeValidacao("A pergunta não pode ser vazia.");
    }
    if (pergunta.length > TAMANHO_MAXIMO_PERGUNTA) {
      throw new ErroDeValidacao(
        `A pergunta deve ter no máximo ${TAMANHO_MAXIMO_PERGUNTA} caracteres.`,
      );
    }

    const historico = entrada.historico ?? [];
    if (historico.length > TAMANHO_MAXIMO_HISTORICO) {
      throw new ErroDeValidacao(
        `O histórico deve ter no máximo ${TAMANHO_MAXIMO_HISTORICO} mensagens.`,
      );
    }

    const resposta = await this.gerador.gerarResposta({ pergunta, historico });

    return { resposta: resposta.trim() };
  }
}
