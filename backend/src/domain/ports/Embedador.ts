/**
 * Porta de saída para geração de embeddings de texto.
 */
export interface Embedador {
  gerarEmbeddings(textos: string[]): Promise<number[][]>;
}
