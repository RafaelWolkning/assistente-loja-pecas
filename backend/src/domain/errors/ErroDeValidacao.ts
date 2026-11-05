/**
 * Erro de validação de regra de negócio.
 * A camada HTTP o traduz para o status 400.
 */
export class ErroDeValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeValidacao";
  }
}
