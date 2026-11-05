/**
 * Entidade de domínio: uma mensagem trocada entre cliente e atendente.
 * Camada de domínio — não depende de frameworks.
 */
export type PapelMensagem = "cliente" | "atendente";

export interface Mensagem {
  papel: PapelMensagem;
  conteudo: string;
}
