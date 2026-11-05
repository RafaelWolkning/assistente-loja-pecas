/**
 * Tipos do atendimento estruturado.
 *
 * A IA devolve um `Atendimento`: a mensagem, os produtos citados, se o assunto
 * é de tecnologia (controle de escopo) e as fontes da web (quando a busca do
 * Google é usada). O backend enriquece cada produto com a comparação de preços.
 */

/** Fonte consultada na web (Google Search grounding). */
export interface FonteWeb {
  titulo: string;
  url: string;
}

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

/** Atendimento cru devolvido pelo provedor de IA (sem enriquecimento). */
export interface Atendimento {
  mensagem: string;
  produtos: ProdutoSugerido[];
  assuntoDeTecnologia: boolean;
  fontesWeb: FonteWeb[];
}

/** Atendimento completo devolvido pela API. */
export interface RespostaAtendimento {
  mensagem: string;
  produtos: ProdutoComPrecos[];
  foraDeEscopo: boolean;
  fontesWeb: FonteWeb[];
  /** Títulos dos trechos da base de conhecimento (RAG) usados na resposta. */
  conhecimento: string[];
}
