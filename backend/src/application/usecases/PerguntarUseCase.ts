import type {
  ProdutoComPrecos,
  RespostaAtendimento,
} from "../../domain/entities/Atendimento.js";
import { ErroDeValidacao } from "../../domain/errors/ErroDeValidacao.js";
import type { Mensagem } from "../../domain/entities/Mensagem.js";
import type { CatalogoProdutos } from "../../domain/ports/CatalogoProdutos.js";
import type { ComparadorDePrecos } from "../../domain/ports/ComparadorDePrecos.js";
import type { RespostaGenerator } from "../../domain/ports/RespostaGenerator.js";

export const TAMANHO_MAXIMO_PERGUNTA = 1000;
export const TAMANHO_MAXIMO_HISTORICO = 20;

export interface EntradaPerguntar {
  pergunta: string;
  historico?: Mensagem[];
}

/**
 * Caso de uso: receber a pergunta do cliente, validar, pedir o atendimento à
 * IA (porta) e enriquecer cada produto citado com a comparação de preços entre
 * as lojas parceiras (porta). Não conhece HTTP, Gemini nem banco.
 */
export class PerguntarUseCase {
  constructor(
    private readonly gerador: RespostaGenerator,
    private readonly comparador: ComparadorDePrecos,
    private readonly catalogo: CatalogoProdutos,
  ) {}

  async executar(entrada: EntradaPerguntar): Promise<RespostaAtendimento> {
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

    const atendimento = await this.gerador.gerarAtendimento({ pergunta, historico });

    const produtos: ProdutoComPrecos[] = atendimento.produtos.map((produto) => ({
      ...produto,
      origemPreco: this.catalogo.buscarPorNome(produto.nome) ? "catalogo" : "estimativa",
      precos: this.comparador.comparar(produto),
    }));

    return {
      mensagem: atendimento.mensagem.trim(),
      produtos,
    };
  }
}
