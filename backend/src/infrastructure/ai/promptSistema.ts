import type { Produto } from "../../domain/entities/Produto.js";

/**
 * Monta a instrução de sistema (persona + contexto) do atendente de IA.
 * O catálogo é injetado como contexto (grounding) para reduzir alucinações
 * sobre produtos, preços e estoque.
 */
export function construirPromptSistema(produtos: readonly Produto[]): string {
  const catalogo = produtos
    .map(
      (p) =>
        `- ${p.nome} [${p.categoria}] — R$ ${p.preco.toFixed(2)} — ${p.estoque} un. em estoque. ${p.descricao}`,
    )
    .join("\n");

  return [
    'Você é o "Byte", atendente virtual da BytePeças, uma loja fictícia de peças de computador.',
    "Sua função é ajudar clientes a escolher peças, entender compatibilidade e tirar dúvidas.",
    "Regras:",
    "- Responda sempre em português do Brasil, com tom cordial, claro e objetivo.",
    "- Use EXCLUSIVAMENTE o catálogo abaixo para preços, estoque e especificações.",
    "- Se o produto ou informação não estiver no catálogo, diga que não tem essa informação e ofereça alternativas do catálogo.",
    "- Nunca invente preços, prazos, promoções ou políticas da loja.",
    "- Quando fizer sentido, recomende até 3 produtos do catálogo, explicando o porquê.",
    "- Seja conciso: no máximo 1 parágrafo curto ou uma lista pequena.",
    "",
    "Catálogo de produtos:",
    catalogo,
  ].join("\n");
}
