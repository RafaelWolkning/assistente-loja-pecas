/**
 * Classifica se um erro do provedor de IA é transitório (vale a pena tentar
 * de novo) ou permanente. Erros 429/5xx e timeouts são tratados como
 * transitórios; 400/401/403/404 (chave inválida, modelo inexistente) não.
 */
export function ehErroTransitorio(erro: unknown): boolean {
  const mensagem = erro instanceof Error ? erro.message : String(erro);

  if (/(^|\D)(400|401|403|404)(\D|$)/.test(mensagem)) {
    return false;
  }

  return /(^|\D)(429|500|502|503|504)(\D|$)|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|deadline|timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED/i.test(
    mensagem,
  );
}
