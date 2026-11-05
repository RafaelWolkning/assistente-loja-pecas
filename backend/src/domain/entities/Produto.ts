/**
 * Entidade de domínio: um produto do catálogo da loja.
 * Usada como contexto (grounding) para o atendente de IA.
 */
export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  descricao: string;
  estoque: number;
}
