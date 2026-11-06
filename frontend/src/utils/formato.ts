const FORMATADOR_BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um valor numérico em reais (BRL). */
export function formatarBRL(valor: number): string {
  return FORMATADOR_BRL.format(valor);
}