/**
 * Tipos do atendimento estruturado.
 *
 * A IA devolve um `Atendimento` (mensagem em linguagem natural + produtos
 * citados). O backend enriquece cada produto com a comparação de preços entre
 * as lojas parceiras fictícias antes de responder ao cliente.
 */

/** Produto citado pela IA (com preço de referência em BRL). */
export interface ProdutoSugerido {
  nome: string;
  categoria: string;
  descricao: string;
  precoReferencia: number;
}

/** Origem do preço de referência: do catálogo da loja ou estimado pela IA. */
export type OrigemPreco = "catalogo" | "estimativa";

/** Preço de um produto em uma loja parceira. */
export interface PrecoLoja {
  loja: string;
  preco: number;
}

/** Produto já enriquecido com a origem do preço e a comparação entre lojas. */
export interface ProdutoComPrecos extends ProdutoSugerido {
  origemPreco: OrigemPreco;
  precos: PrecoLoja[];
}

/** Atendimento completo devolvido pela API. */
export interface RespostaAtendimento {
  mensagem: string;
  produtos: ProdutoComPrecos[];
}

/** Atendimento cru devolvido pelo provedor de IA (sem enriquecimento). */
export interface Atendimento {
  mensagem: string;
  produtos: ProdutoSugerido[];
}
