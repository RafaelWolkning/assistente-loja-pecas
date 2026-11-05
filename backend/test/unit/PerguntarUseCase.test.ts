import { describe, expect, it, vi } from "vitest";

import { PerguntarUseCase } from "../../src/application/usecases/PerguntarUseCase.js";
import type { Atendimento, ProdutoSugerido } from "../../src/domain/entities/Atendimento.js";
import { ErroDeValidacao } from "../../src/domain/errors/ErroDeValidacao.js";
import type { CatalogoProdutos } from "../../src/domain/ports/CatalogoProdutos.js";
import type { ComparadorDePrecos } from "../../src/domain/ports/ComparadorDePrecos.js";
import type {
  EntradaAtendimento,
  RespostaGenerator,
} from "../../src/domain/ports/RespostaGenerator.js";

class GeradorFake implements RespostaGenerator {
  public ultimaEntrada: EntradaAtendimento | undefined;

  constructor(
    private readonly atendimento: Atendimento = {
      mensagem: "Resposta de teste",
      produtos: [],
    },
  ) {}

  async gerarAtendimento(entrada: EntradaAtendimento): Promise<Atendimento> {
    this.ultimaEntrada = entrada;
    return this.atendimento;
  }
}

class ComparadorFake implements ComparadorDePrecos {
  public comparados: ProdutoSugerido[] = [];

  comparar(produto: ProdutoSugerido) {
    this.comparados.push(produto);
    return [
      { loja: "Loja A", preco: produto.precoReferencia },
      { loja: "Loja B", preco: produto.precoReferencia + 10 },
    ];
  }
}

class CatalogoFake implements CatalogoProdutos {
  constructor(private readonly chaves: string[] = []) {}
  listar() {
    return [];
  }
  buscarPorNome(nome: string) {
    const alvo = nome.toLowerCase();
    return this.chaves.some((chave) => alvo.includes(chave))
      ? {
          id: "x",
          nome,
          categoria: "Cat",
          preco: 1,
          descricao: "d",
          estoque: 1,
        }
      : undefined;
  }
}

function criarUseCase(
  gerador: RespostaGenerator,
  comparador: ComparadorDePrecos = new ComparadorFake(),
  catalogo: CatalogoProdutos = new CatalogoFake(),
) {
  return new PerguntarUseCase(gerador, comparador, catalogo);
}

describe("PerguntarUseCase", () => {
  it("remove espaços das bordas da pergunta e da mensagem", async () => {
    const gerador = new GeradorFake({ mensagem: "   Olá!  ", produtos: [] });
    const resultado = await criarUseCase(gerador).executar({
      pergunta: "  Quero um SSD  ",
    });

    expect(resultado.mensagem).toBe("Olá!");
    expect(gerador.ultimaEntrada?.pergunta).toBe("Quero um SSD");
  });

  it("usa histórico vazio por padrão", async () => {
    const gerador = new GeradorFake();
    await criarUseCase(gerador).executar({ pergunta: "Olá" });

    expect(gerador.ultimaEntrada?.historico).toEqual([]);
  });

  it("repassa o histórico informado ao gerador", async () => {
    const gerador = new GeradorFake();
    const historico = [{ papel: "cliente" as const, conteudo: "Oi" }];

    await criarUseCase(gerador).executar({ pergunta: "E aí?", historico });

    expect(gerador.ultimaEntrada?.historico).toEqual(historico);
  });

  it("enriquece os produtos com a comparação de preços", async () => {
    const comparador = new ComparadorFake();
    const gerador = new GeradorFake({
      mensagem: "Veja:",
      produtos: [
        {
          nome: "SSD NVMe 1TB",
          categoria: "Armazenamento",
          descricao: "rápido",
          precoReferencia: 400,
        },
      ],
    });

    const resultado = await criarUseCase(gerador, comparador).executar({
      pergunta: "SSD?",
    });

    expect(resultado.produtos).toHaveLength(1);
    expect(resultado.produtos[0]?.precos).toHaveLength(2);
    expect(comparador.comparados).toHaveLength(1);
  });

  it("marca a origem do preço como catálogo ou estimativa", async () => {
    const gerador = new GeradorFake({
      mensagem: "ok",
      produtos: [
        {
          nome: "SSD NVMe Kingston 1TB",
          categoria: "Armazenamento",
          descricao: "a",
          precoReferencia: 400,
        },
        {
          nome: "Monitor Curvo X",
          categoria: "Monitores",
          descricao: "b",
          precoReferencia: 1200,
        },
      ],
    });
    const catalogo = new CatalogoFake(["ssd"]);

    const resultado = await criarUseCase(gerador, new ComparadorFake(), catalogo).executar({
      pergunta: "oi",
    });

    expect(resultado.produtos[0]?.origemPreco).toBe("catalogo");
    expect(resultado.produtos[1]?.origemPreco).toBe("estimativa");
  });

  it("lança ErroDeValidacao para pergunta vazia", async () => {
    await expect(criarUseCase(new GeradorFake()).executar({ pergunta: "   " })).rejects.toBeInstanceOf(
      ErroDeValidacao,
    );
  });

  it("lança ErroDeValidacao para pergunta acima do limite", async () => {
    await expect(
      criarUseCase(new GeradorFake()).executar({ pergunta: "a".repeat(1001) }),
    ).rejects.toThrow(/no máximo 1000 caracteres/);
  });

  it("lança ErroDeValidacao para histórico acima do limite", async () => {
    const historico = Array.from({ length: 21 }, () => ({
      papel: "cliente" as const,
      conteudo: "x",
    }));

    await expect(
      criarUseCase(new GeradorFake()).executar({ pergunta: "oi", historico }),
    ).rejects.toThrow(/no máximo 20 mensagens/);
  });

  it("propaga erro lançado pelo gerador", async () => {
    const gerador = {
      gerarAtendimento: vi.fn().mockRejectedValue(new Error("falha na IA")),
    };

    await expect(criarUseCase(gerador).executar({ pergunta: "oi" })).rejects.toThrow(
      "falha na IA",
    );
  });
});
