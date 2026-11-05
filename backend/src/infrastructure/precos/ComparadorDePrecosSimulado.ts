import type { PrecoLoja, ProdutoSugerido } from "../../domain/entities/Atendimento.js";
import type { ComparadorDePrecos } from "../../domain/ports/ComparadorDePrecos.js";

/**
 * Lojas parceiras FICTÍCIAS da BytePeças. Os preços são simulados de forma
 * determinística — este projeto é acadêmico e não representa preços reais de
 * nenhum varejista.
 */
export const LOJAS_PARCEIRAS = [
  "BytePeças",
  "MegaByte Informática",
  "TecNoAr",
  "InfoStore Brasil",
  "Hardware Prime",
] as const;

/** Hash determinístico (FNV-1a de 32 bits) para gerar variações estáveis. */
function hash(texto: string): number {
  let valor = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    valor ^= texto.charCodeAt(i);
    valor = Math.imul(valor, 16777619);
  }
  return valor >>> 0;
}

/** Variação de preço entre -8% e +8%, estável para a mesma loja/produto. */
function variacao(seed: number): number {
  return ((seed % 1000) / 1000) * 0.16 - 0.08;
}

/**
 * Comparador determinístico de preços (simulado).
 * Para o mesmo produto, a tabela é sempre a mesma: bom para demonstração e
 * testes. Trocar por dados reais = trocar apenas este adaptador.
 */
export class ComparadorDePrecosSimulado implements ComparadorDePrecos {
  constructor(private readonly lojas: readonly string[] = LOJAS_PARCEIRAS) {}

  comparar(produto: ProdutoSugerido): PrecoLoja[] {
    const base = Number.isFinite(produto.precoReferencia)
      ? Math.max(0, produto.precoReferencia)
      : 0;

    return this.lojas
      .map((loja) => {
        const preco = base * (1 + variacao(hash(`${produto.nome}|${loja}`)));
        return { loja, preco: Math.round(preco * 100) / 100 };
      })
      .sort((a, b) => a.preco - b.preco);
  }
}
