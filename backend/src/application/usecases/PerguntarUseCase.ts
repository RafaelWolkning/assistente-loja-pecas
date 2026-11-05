import type {
  ProdutoComPrecos,
  RespostaAtendimento,
} from "../../domain/entities/Atendimento.js";
import type { TrechoConhecimento } from "../../domain/entities/Conhecimento.js";
import { ErroDeValidacao } from "../../domain/errors/ErroDeValidacao.js";
import type { Mensagem } from "../../domain/entities/Mensagem.js";
import type { CatalogoProdutos } from "../../domain/ports/CatalogoProdutos.js";
import type { ComparadorDePrecos } from "../../domain/ports/ComparadorDePrecos.js";
import type { RecuperadorConhecimento } from "../../domain/ports/RecuperadorConhecimento.js";
import type { RespostaGenerator } from "../../domain/ports/RespostaGenerator.js";

export const TAMANHO_MAXIMO_PERGUNTA = 1000;
export const TAMANHO_MAXIMO_HISTORICO = 20;
export const LIMITE_CONHECIMENTO_PADRAO = 4;

export const MENSAGEM_FORA_DE_ESCOPO =
  "Desculpe, eu só consigo ajudar com computadores, peças e produtos de tecnologia. " +
  "Pode me perguntar sobre montagem de PC, processadores, placas de vídeo, monitores, " +
  "periféricos e tudo mais relacionado a tecnologia!";

export interface EntradaPerguntar {
  pergunta: string;
  historico?: Mensagem[];
}

/**
 * Caso de uso: validar a pergunta, recuperar conhecimento relevante (RAG), pedir
 * o atendimento à IA (porta), aplicar o controle de escopo (só tecnologia) e
 * enriquecer os produtos com a comparação de preços (porta).
 */
export class PerguntarUseCase {
  constructor(
    private readonly gerador: RespostaGenerator,
    private readonly comparador: ComparadorDePrecos,
    private readonly catalogo: CatalogoProdutos,
    private readonly recuperador?: RecuperadorConhecimento,
    private readonly limiteConhecimento: number = LIMITE_CONHECIMENTO_PADRAO,
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

    const conhecimento = await this.recuperarConhecimento(pergunta);

    const atendimento = await this.gerador.gerarAtendimento({
      pergunta,
      historico,
      conhecimento,
    });

    if (!atendimento.assuntoDeTecnologia) {
      return {
        mensagem: MENSAGEM_FORA_DE_ESCOPO,
        produtos: [],
        foraDeEscopo: true,
        fontesWeb: [],
        conhecimento: [],
      };
    }

    const produtos: ProdutoComPrecos[] = atendimento.produtos.map((produto) => ({
      ...produto,
      origemPreco: this.catalogo.buscarPorNome(produto.nome) ? "catalogo" : "estimativa",
      precos: this.comparador.comparar(produto),
    }));

    return {
      mensagem: atendimento.mensagem.trim(),
      produtos,
      foraDeEscopo: false,
      fontesWeb: atendimento.fontesWeb,
      conhecimento: conhecimento.map((trecho) => trecho.titulo),
    };
  }

  private async recuperarConhecimento(pergunta: string): Promise<TrechoConhecimento[]> {
    if (!this.recuperador) {
      return [];
    }
    try {
      return await this.recuperador.buscar(pergunta, this.limiteConhecimento);
    } catch {
      // RAG é um aprimoramento: se falhar, seguimos sem ele.
      return [];
    }
  }
}
