import type { FastifyInstance } from "fastify";

import type { PerguntarUseCase } from "../../../application/usecases/PerguntarUseCase.js";
import type { Mensagem } from "../../../domain/entities/Mensagem.js";

interface CorpoPerguntar {
  pergunta: string;
  historico?: Mensagem[];
}

const esquemaPerguntar = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["pergunta"],
    properties: {
      pergunta: { type: "string", minLength: 1, maxLength: 1000 },
      historico: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["papel", "conteudo"],
          properties: {
            papel: { type: "string", enum: ["cliente", "atendente"] },
            conteudo: { type: "string", minLength: 1, maxLength: 4000 },
          },
        },
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        mensagem: { type: "string" },
        produtos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nome: { type: "string" },
              categoria: { type: "string" },
              descricao: { type: "string" },
              precoReferencia: { type: "number" },
              origemPreco: { type: "string" },
              precos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    loja: { type: "string" },
                    preco: { type: "number" },
                  },
                  required: ["loja", "preco"],
                },
              },
            },
            required: ["nome", "categoria", "descricao", "precoReferencia", "origemPreco", "precos"],
          },
        },
      },
      required: ["mensagem", "produtos"],
    },
  },
} as const;

export function registrarRotaPerguntar(
  app: FastifyInstance,
  casoDeUso: PerguntarUseCase,
): void {
  app.post<{ Body: CorpoPerguntar }>(
    "/perguntar",
    { schema: esquemaPerguntar },
    async (requisicao, resposta) => {
      const resultado = await casoDeUso.executar({
        pergunta: requisicao.body.pergunta,
        historico: requisicao.body.historico ?? [],
      });

      return resposta.status(200).send(resultado);
    },
  );
}
