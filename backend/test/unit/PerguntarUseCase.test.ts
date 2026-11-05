import { describe, expect, it, vi } from "vitest";

import {
  MENSAGEM_FORA_DE_ESCOPO,
  PerguntarUseCase,
} from "../../src/application/usecases/PerguntarUseCase.js";
import type { Atendimento, ProdutoSugerido } from "../../src/domain/entities/Atendimento.js";
import type { TrechoConhecimento } from "../../src/domain/entities/Conhecimento.js";
import { ErroDeValidacao } from "../../src/domain/errors/ErroDeValidacao.js";
import type { CatalogoProdutos } from "../../src/domain/ports/CatalogoProdutos.js";
import type { ComparadorDePrecos } from "../../src/domain/ports/ComparadorDePrecos.js";
import type { RecuperadorConhecimento } from "../../src/domain/ports/RecuperadorConhecimento.js";
import type {
  EntradaAtendimento,
  RespostaGenerator,
} from "../../src/domain/ports/RespostaGenerator.js";

const atendimentoPadrao: Atendimento = {
  mensagem: "Resposta de teste",
  produtos: [],
  assuntoDeTecnologia: true,
  fontesWeb: [],
};

class GeradorFake implements RespostaGenerator {
  public ultimaEntrada: EntradaAtendimento | undefined;

  constructor(private readonly atendimento: Atendimento = atendimentoPadrao) {}

  async gerarAtendimento(entrada: EntradaAtendimento): Promise<Atendimento> {
    this.ultimaEntrada = entrada;
    return this.atendimento;
  }
}

class ComparadorFake implements ComparadorDePrecos {
  public comparados: ProdutoSugerido[] = [];

  comparar(produto: ProdutoSugerido) {
    this.comparados.push(produto);
    return [{ loja: "Loja A", preco: produto.precoReferencia }];
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
      ? { id: "x", nome, categoria: "Cat", preco: 1, descricao: "d", estoque: 1 }
      : undefined;
  }
}

class RecuperadorFake implements RecuperadorConhecimento {
  public consulta: string | undefined;
  constructor(private readonly trechos: TrechoConhecimento[] = []) {}
  async buscar(consulta: string, limite: number) {
    this.consulta = consulta;
    return this.trechos.slice(0, limite);
  }
}

function criarUseCase(
  gerador: RespostaGenerator,
  comparador: ComparadorDePrecos = new ComparadorFake(),
  catalogo: CatalogoProdutos = new CatalogoFake(),
  recuperador?: RecuperadorConhecimento,
) {
  return new PerguntarUseCase(gerador, comparador, catalogo, recuperador);
}

describe("PerguntarUseCase", () => {
  it("remove espaços das bordas da pergunta e da mensagem", async () => {
    const gerador = new GeradorFake({ ...atendimentoPadrao, mensagem: "   Olá!  " });
    const resultado = await criarUseCase(gerador).executar({ pergunta: "  Quero um SSD  " });

    expect(resultado.mensagem).toBe("Olá!");
    expect(gerador.ultimaEntrada?.pergunta).toBe("Quero um SSD");
  });

  it("usa histórico vazio por padrão", async () => {
    const gerador = new GeradorFake();
    await criarUseCase(gerador).executar({ pergunta: "Olá" });
    expect(gerador.ultimaEntrada?.historico).toEqual([]);
  });

  it("recupera e repassa o conhecimento (RAG)", async () => {
    const gerador = new GeradorFake();
    const recuperador = new RecuperadorFake([
      { id: "a", titulo: "Monitores", conteudo: "...", pontuacao: 2 },
    ]);

    const resultado = await criarUseCase(gerador, undefined, undefined, recuperador).executar({
      pergunta: "Quero um monitor",
    });

    expect(gerador.ultimaEntrada?.conhecimento).toHaveLength(1);
    expect(resultado.conhecimento).toEqual(["Monitores"]);
  });

  it("segue sem conhecimento quando o RAG falha", async () => {
    const gerador = new GeradorFake();
    const recuperador = {
      buscar: vi.fn().mockRejectedValue(new Error("sem cota")),
    };

    const resultado = await criarUseCase(gerador, undefined, undefined, recuperador).executar({
      pergunta: "oi",
    });

    expect(resultado.conhecimento).toEqual([]);
  });

  it("recusa perguntas fora do escopo de tecnologia", async () => {
    const gerador = new GeradorFake({ ...atendimentoPadrao, assuntoDeTecnologia: false });
    const resultado = await criarUseCase(gerador).executar({ pergunta: "Qual a melhor pastilha de freio?" });

    expect(resultado.foraDeEscopo).toBe(true);
    expect(resultado.mensagem).toBe(MENSAGEM_FORA_DE_ESCOPO);
    expect(resultado.produtos).toEqual([]);
  });

  it("propaga as fontes da web", async () => {
    const gerador = new GeradorFake({
      ...atendimentoPadrao,
      fontesWeb: [{ titulo: "Site X", url: "https://x.com" }],
    });
    const resultado = await criarUseCase(gerador).executar({ pergunta: "oi" });

    expect(resultado.fontesWeb).toEqual([{ titulo: "Site X", url: "https://x.com" }]);
  });

  it("enriquece os produtos com a comparação de preços", async () => {
    const comparador = new ComparadorFake();
    const gerador = new GeradorFake({
      ...atendimentoPadrao,
      produtos: [{ nome: "SSD NVMe 1TB", categoria: "Armazenamento", descricao: "rápido", precoReferencia: 400 }],
    });

    const resultado = await criarUseCase(gerador, comparador).executar({ pergunta: "SSD?" });

    expect(resultado.produtos[0]?.precos).toHaveLength(1);
    expect(comparador.comparados).toHaveLength(1);
  });

  it("marca a origem do preço como catálogo ou estimativa", async () => {
    const gerador = new GeradorFake({
      ...atendimentoPadrao,
      produtos: [
        { nome: "SSD NVMe Kingston 1TB", categoria: "Armazenamento", descricao: "a", precoReferencia: 400 },
        { nome: "Monitor Curvo X", categoria: "Monitores", descricao: "b", precoReferencia: 1200 },
      ],
    });

    const resultado = await criarUseCase(gerador, undefined, new CatalogoFake(["ssd"])).executar({
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

    await expect(criarUseCase(gerador).executar({ pergunta: "oi" })).rejects.toThrow("falha na IA");
  });
});
