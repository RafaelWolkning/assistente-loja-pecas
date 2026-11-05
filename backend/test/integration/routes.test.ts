import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import { montarAplicacao } from "../../src/composition.js";
import type { Atendimento } from "../../src/domain/entities/Atendimento.js";
import { ErroDeIntegracaoIA } from "../../src/domain/errors/ErroDeIntegracaoIA.js";
import type {
  EntradaAtendimento,
  RespostaGenerator,
} from "../../src/domain/ports/RespostaGenerator.js";
import type { Config } from "../../src/infrastructure/config/env.js";

const configTeste: Config = {
  porta: 0,
  geminiApiKey: "chave-fake-sem-chamada-real",
  geminiModelo: "gemini-fake",
  corsOrigem: "*",
  logLevel: "silent",
  versao: "0.0.0-teste",
  tentativasIA: 1,
  atrasoBaseMs: 1,
};

class GeradorEspiao implements RespostaGenerator {
  public ultimaEntrada: EntradaAtendimento | undefined;

  constructor(
    private readonly atendimento: Atendimento = {
      mensagem: "Olá! Sou o Byte da BytePeças.",
      produtos: [],
    },
  ) {}

  async gerarAtendimento(entrada: EntradaAtendimento): Promise<Atendimento> {
    this.ultimaEntrada = entrada;
    return this.atendimento;
  }
}

const apps: FastifyInstance[] = [];

function criarApp(gerador: RespostaGenerator): FastifyInstance {
  const app = montarAplicacao(configTeste, {
    gerador,
    obterUptime: () => 12.4,
    agora: () => new Date("2026-11-04T12:00:00.000Z"),
  });
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("API HTTP (integração, IA simulada)", () => {
  it("GET / devolve os metadados da API", async () => {
    const resposta = await criarApp(new GeradorEspiao()).inject({
      method: "GET",
      url: "/",
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toHaveProperty("endpoints.perguntar");
  });

  it("GET /saude devolve o status da aplicação", async () => {
    const resposta = await criarApp(new GeradorEspiao()).inject({
      method: "GET",
      url: "/saude",
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({
      status: "ok",
      uptimeSegundos: 12,
      versao: "0.0.0-teste",
      modelo: "gemini-fake",
    });
  });

  it("GET /produtos devolve o catálogo", async () => {
    const resposta = await criarApp(new GeradorEspiao()).inject({
      method: "GET",
      url: "/produtos",
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json().produtos.length).toBeGreaterThan(0);
  });

  it("POST /perguntar devolve mensagem e produtos", async () => {
    const gerador = new GeradorEspiao();
    const resposta = await criarApp(gerador).inject({
      method: "POST",
      url: "/perguntar",
      payload: { pergunta: "Quero um SSD NVMe" },
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toEqual({
      mensagem: "Olá! Sou o Byte da BytePeças.",
      produtos: [],
    });
    expect(gerador.ultimaEntrada?.pergunta).toBe("Quero um SSD NVMe");
  });

  it("POST /perguntar enriquece produtos com a comparação de preços", async () => {
    const gerador = new GeradorEspiao({
      mensagem: "Separei isto para você:",
      produtos: [
        {
          nome: "Monitor Gamer Samsung Odyssey G5",
          categoria: "Monitores",
          descricao: "27 polegadas 165Hz",
          precoReferencia: 1699,
        },
      ],
    });

    const resposta = await criarApp(gerador).inject({
      method: "POST",
      url: "/perguntar",
      payload: { pergunta: "Quero um monitor" },
    });

    const corpo = resposta.json();
    expect(corpo.produtos).toHaveLength(1);
    expect(corpo.produtos[0].origemPreco).toBe("catalogo");
    expect(corpo.produtos[0].precos.length).toBeGreaterThan(0);
    expect(corpo.produtos[0].precos[0]).toHaveProperty("loja");
    expect(corpo.produtos[0].precos[0]).toHaveProperty("preco");
  });

  it("POST /perguntar rejeita payload inválido (400)", async () => {
    const app = criarApp(new GeradorEspiao());

    const semPergunta = await app.inject({
      method: "POST",
      url: "/perguntar",
      payload: {},
    });
    expect(semPergunta.statusCode).toBe(400);

    const perguntaLonga = await app.inject({
      method: "POST",
      url: "/perguntar",
      payload: { pergunta: "a".repeat(1001) },
    });
    expect(perguntaLonga.statusCode).toBe(400);
  });

  it("POST /perguntar rejeita pergunta só com espaços (400)", async () => {
    const resposta = await criarApp(new GeradorEspiao()).inject({
      method: "POST",
      url: "/perguntar",
      payload: { pergunta: "    " },
    });

    expect(resposta.statusCode).toBe(400);
    expect(resposta.json().erro).toMatch(/não pode ser vazia/);
  });

  it("POST /perguntar devolve 503 quando o provedor de IA falha", async () => {
    const gerador = {
      gerarAtendimento: vi
        .fn()
        .mockRejectedValue(new ErroDeIntegracaoIA("provedor fora do ar")),
    };
    const resposta = await criarApp(gerador).inject({
      method: "POST",
      url: "/perguntar",
      payload: { pergunta: "Oi" },
    });

    expect(resposta.statusCode).toBe(503);
    expect(resposta.json().erro).toMatch(/indisponível/);
  });

  it("rota inexistente devolve 404", async () => {
    const resposta = await criarApp(new GeradorEspiao()).inject({
      method: "GET",
      url: "/rota-que-nao-existe",
    });

    expect(resposta.statusCode).toBe(404);
  });
});
