# BytePeças — Assistente de Atendimento com IA Generativa

![CI](https://github.com/RafaelWolkning/assistente-loja-pecas/actions/workflows/ci.yml/badge.svg?branch=main)
![Cobertura](https://img.shields.io/badge/cobertura-95%25-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D22-blue)
![License](https://img.shields.io/badge/licen%C3%A7a-MIT-lightgrey)

Um sistema de **perguntas e respostas com IA Generativa (Google Gemini)** para
uma **loja fictícia de peças de computador**. O cliente digita uma pergunta e a
IA responde no papel do atendente "Byte", usando o catálogo da loja como
contexto (grounding).

> Projeto acadêmico. A loja "BytePeças", seus produtos e preços são fictícios.

## Demonstração

| | URL |
|---|---|
| **Aplicação (frontend)** | https://bytepecas-web.vercel.app |
| **API (backend)** | https://bytepecas-api.onrender.com |
| Saúde da API | https://bytepecas-api.onrender.com/saude |

> A API está no plano gratuito do Render e hiberna após ~15 min sem uso. A
> primeira requisição pode levar ~30–50 s para "acordar"; a interface mostra
> esse estado automaticamente. Acesse a aplicação uma vez antes de gravar o vídeo.

## Interface

A interface é uma conversa com o mascote **Byte** — um computadorzinho com
olhos, em SVG animado por CSS, que **pensa** e **fala** junto com a resposta
(efeito de digitação). Tem animações de entrada, fundo "aurora" animado e
respeita `prefers-reduced-motion`. Detalhes em
[`ARQUITETURA.md`](./ARQUITETURA.md#11-experiência-do-frontend-para-o-vídeo).

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Metadados da API e lista de endpoints |
| `GET` | `/saude` | Saúde/status (usado no health check e no warm-up) |
| `GET` | `/produtos` | Catálogo de peças da loja (grounding da IA) |
| `POST` | `/perguntar` | Pergunta ao atendente de IA e recebe a resposta |

Exemplo:

```bash
curl -X POST http://localhost:3000/perguntar \
  -H "Content-Type: application/json" \
  -d '{"pergunta":"Vocês têm SSD NVMe de 1TB? Qual o preço?"}'
# { "resposta": "Olá! Temos o SSD NVMe Kingston NV3 1TB por R$ 449.90 ..." }
```

O corpo de `POST /perguntar` aceita `pergunta` (obrigatória, 1–1000 caracteres)
e `historico` (opcional, até 20 mensagens `{ papel: "cliente"|"atendente",
conteudo }`) para conversas com contexto.

## Stack

- **Backend:** Node.js + TypeScript + Fastify, arquitetura em camadas
  (Ports & Adapters), SDK oficial `@google/genai`.
- **Frontend:** React + Vite + TypeScript.
- **Testes:** Vitest + `@vitest/coverage-v8` (IA simulada/mock).
- **CI/CD:** GitHub Actions.
- **Deploy:** Render (API) + Vercel (frontend).

## Arquitetura

Resumo das camadas: `domain` (entidades, erros e **portas**) → `application`
(casos de uso) → `infrastructure` (adaptador Gemini, catálogo, retry, config) →
`interfaces/http` (Fastify). O **composition root** (`src/composition.ts`) monta
o grafo. Detalhes completos, com diagrama e o passo a passo de uma pergunta, em
[`ARQUITETURA.md`](./ARQUITETURA.md).

A IA fica atrás da porta `RespostaGenerator`; o `PerguntarUseCase` não conhece o
Gemini. É isso que torna a IA **mockável** nos testes.

## Como rodar localmente

Pré-requisitos: Node.js ≥ 22 e uma chave do Google Gemini
([AI Studio](https://aistudio.google.com/app/apikey)).

```bash
# 1) Backend
cd backend
cp .env.example .env          # edite e coloque sua GEMINI_API_KEY
npm install
npm run dev                   # API em http://localhost:3000

# 2) Frontend (em outro terminal)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3000
npm install
npm run dev                   # app em http://localhost:5173
```

### Variáveis de ambiente

Backend (`backend/.env`):

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `GEMINI_API_KEY` | sim | — | Chave da API Gemini |
| `GEMINI_MODEL` | não | `gemini-3.5-flash-lite` | Modelo utilizado |
| `PORT` | não | `3000` | Porta do servidor |
| `CORS_ORIGIN` | não | `*` | Origens permitidas (vírgula) |
| `LOG_LEVEL` | não | `info` | Nível de log do Fastify |
| `IA_TENTATIVAS` | não | `3` | Tentativas em erros transitórios |
| `IA_ATRASO_BASE_MS` | não | `800` | Backoff base (cresce exponencialmente) |

Frontend (`frontend/.env`):

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (sem barra no final) |

## Testes

```bash
cd backend
npm test              # roda os testes
npm run test:coverage # testes + cobertura (falha se < 70%)
```

- Testes **unitários** e de **integração** (via `app.inject`).
- A chamada à IA é **simulada (mock)** — nenhum teste usa rede ou chave real.
- Cobertura mínima de **70%** imposta em `vitest.config.ts`; valor atual **~95%**.

## CI/CD

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) roda a cada
push ou pull request para `main`:

- **backend:** instala dependências, checa tipos e roda testes com cobertura.
- **frontend:** instala dependências, checa tipos e builda o bundle.

O **badge de CI** no topo desta página fica verde quando o pipeline passa.

## Segurança — chaves de API

- **Nenhuma chave é versionada.** `.env` está no `.gitignore` e o repositório
  traz apenas `.env.example` com placeholders.
- Em produção, a chave vive em **variáveis de ambiente** da plataforma
  (`GEMINI_API_KEY` no painel do Render, marcada como secreta no `render.yaml`).
- O CI usa uma chave fictícia, pois a IA é mockada.

## Deploy

- **API (Render):** o arquivo [`render.yaml`](./render.yaml) descreve o Web
  Service (Blueprint). Configure `GEMINI_API_KEY` e `CORS_ORIGIN` no painel.
- **Frontend (Vercel):** importe o repositório, aponte o *root directory* para
  `frontend` e defina `VITE_API_URL` com a URL pública da API.

## Documentação

- [`ARQUITETURA.md`](./ARQUITETURA.md) — arquitetura e passo a passo (para o vídeo).
- [`DECISOES.md`](./DECISOES.md) — por que esta stack e o que foi aprendido.
- [`docs/intent/`](./docs/intent) — intenção confirmada do projeto.

## Licença

MIT.
