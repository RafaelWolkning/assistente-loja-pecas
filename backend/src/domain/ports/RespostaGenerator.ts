import type { Atendimento } from "../entities/Atendimento.js";
import type { TrechoConhecimento } from "../entities/Conhecimento.js";
import type { Mensagem } from "../entities/Mensagem.js";

/**
 * Porta (interface) de saída do domínio para geração do atendimento por IA.
 *
 * A aplicação depende apenas desta abstração; o provedor concreto
 * (Gemini, OpenAI, um fake de teste) é um detalhe de infraestrutura.
 * É o que permite simular (mockar) a IA nos testes.
 */
export interface EntradaAtendimento {
  pergunta: string;
  historico: readonly Mensagem[];
  /** Trechos recuperados da base de conhecimento (RAG) para fundamentar a resposta. */
  conhecimento?: readonly TrechoConhecimento[];
}

export interface RespostaGenerator {
  gerarAtendimento(entrada: EntradaAtendimento): Promise<Atendimento>;
}
