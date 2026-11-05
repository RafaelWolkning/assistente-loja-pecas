/**
 * Erro de integração com o provedor de IA.
 * A camada HTTP o traduz para 503 (serviço indisponível), deixando claro que
 * a falha é do provedor externo e não da aplicação.
 */
export class ErroDeIntegracaoIA extends Error {
  constructor(mensagem: string, causa?: unknown) {
    super(mensagem, causa !== undefined ? { cause: causa } : undefined);
    this.name = "ErroDeIntegracaoIA";
  }
}
