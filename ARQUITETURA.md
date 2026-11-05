# Arquitetura — BytePeças

Documento de apoio para a demonstração em vídeo. Explica **como** o sistema é
organizado e **o que acontece passo a passo** quando um cliente envia uma
pergunta.

## 1. Visão geral

```
┌────────────────────────┐        HTTPS/JSON        ┌──────────────────────────┐
│  Frontend (Vercel)     │  ───────────────────────▶ │  API (Render)            │
│  React + Vite + TS     │  ◀─────────────────────── │  Node + Fastify + TS     │
│  - chat, sugestões     │                           │  - /saude /produtos      │
│  - status do servidor  │                           │    /perguntar            │
└────────────────────────┘                           └───────────┬──────────────┘
                                                                  │ SDK oficial
                                                                  ▼
                                                      ┌──────────────────────────┐
                                                      │ Google Gemini API        │
                                                      │ (gemini-3.5-flash-lite)  │
                                                      └──────────────────────────┘
```

O frontend não conhece o Gemini. A API é a única que fala com o provedor de IA.

## 2. Camadas do backend (Clean Architecture / Ports & Adapters)

O backend é dividido em quatro camadas, com dependências apontando **para
dentro** (de fora para dentro: interfaces → infraestrutura → aplicação → domínio).

| Camada | Pasta | Responsabilidade | Conhece |
|---|---|---|---|
| **Domínio** | `src/domain` | Entidades (`Mensagem`, `Produto`), erros de negócio e **portas** (interfaces de saída) | nada de framework |
| **Aplicação** | `src/application` | Casos de uso: orquestram regras e chamam portas | domínio |
| **Infraestrutura** | `src/infrastructure` | Adaptadores concretos: Gemini, catálogo, config, retry | domínio + SDK |
| **Interfaces** | `src/interfaces/http` | Fastify, rotas, schemas, tratamento de erros | aplicação |

O ponto de montagem é o **composition root** (`src/composition.ts`), único lugar
que instancia os adaptadores e injeta nos casos de uso. `src/server.ts` apenas
sobe o servidor.

### Portas e adaptadores

| Porta (domínio) | Adaptador (infra) | Papel |
|---|---|---|
| `RespostaGenerator` | `GeminiRespostaGenerator` | Gera a resposta da IA |
| `RespostaGenerator` (decorado) | `GeradorComRetentativas` | Adiciona retry com backoff |
| `CatalogoProdutos` | `CatalogoEmMemoria` | Fornece os produtos (grounding + preço de catálogo) |
| `ComparadorDePrecos` | `ComparadorDePrecosSimulado` | Gera a tabela de preços por loja parceira |
| `RecuperadorConhecimento` | `RecuperadorHibrido` (vetorial + lexical) | Recupera trechos da base de conhecimento (RAG) |
| `Embedador` | `EmbedadorGemini` | Gera embeddings para o RAG |

Essa indireção é o que permite **simular a IA nos testes**: basta passar um
`RespostaGenerator` falso para `montarAplicacao`, sem chave e sem rede.

## 3. Passo a passo de uma pergunta (`POST /perguntar`)

1. **Frontend** — o usuário digita a pergunta e o React chama `perguntar()` em
   `src/api/client.ts`, que faz `fetch` para `${VITE_API_URL}/perguntar` com
   `{ pergunta, historico }`.
2. **Fastify** — a rota `interfaces/http/routes/perguntar.ts` valida o corpo
   contra um **JSON Schema** (pergunta obrigatória, 1–1000 caracteres, histórico
   de até 20 itens). Corpo inválido → `400`.
3. **Caso de uso** — `PerguntarUseCase.executar()` normaliza a pergunta
   (`trim`), aplica regras de negócio (não vazia, limites de tamanho) e lança
   `ErroDeValidacao` quando necessário.
4. **Porta de IA** — o caso de uso chama `RespostaGenerator.gerarResposta()`.
   Como só conhece a interface, não sabe que existe Gemini.
5. **Resiliência** — `GeradorComRetentativas` tenta novamente em erros
   transitórios (`429`/`503`) com backoff exponencial (800ms, 1600ms, …).
6. **Adaptador Gemini** — `GeminiRespostaGenerator` monta o conteúdo
   (histórico com papéis `cliente`→`user`, `atendente`→`model`, + a pergunta) e
   chama `ai.models.generateContent` com a **instrução de sistema** (persona
   "Byte", catálogo como grounding e tom de **conhecimento amplo de
   tecnologia**) e **saída estruturada** (`responseMimeType:
   application/json` + `responseJsonSchema`). A IA devolve
   `{ mensagem, produtos[] }`; o adaptador interpreta e valida o JSON. Erros
   viram `ErroDeIntegracaoIA`.
7. **Comparação de preços** — para cada produto, o `PerguntarUseCase` consulta o
   `ComparadorDePrecos` (simulado e **determinístico**) e marca a origem do preço
   (`catalogo` se o produto estiver no catálogo; `estimativa` caso contrário).
8. **Resposta** — a rota devolve `200 { mensagem, produtos[] }`, onde cada
   produto traz `precos: [{ loja, preco }]`. Se a IA falhar, o handler de erro
   converte `ErroDeIntegracaoIA` em `503` amigável.
9. **Frontend** — o React adiciona a bolha do atendente: a **mensagem em
   parágrafos** é datilografada e, ao terminar, surgem os **cards de produto**
   com ilustração e a **tabela de preços** por loja (melhor preço destacado).
8. **Frontend** — o React adiciona a bolha do atendente ao chat.

## 4. Tratamento de erros (mapa de status)

| Situação | Exceção | Status HTTP |
|---|---|---|
| Corpo inválido (schema) | validação do Fastify | `400` |
| Regra de negócio (pergunta vazia/limite) | `ErroDeValidacao` | `400` |
| Provedor de IA indisponível | `ErroDeIntegracaoIA` | `503` |
| Rota inexistente | — | `404` |
| Erro inesperado | qualquer | `500` |

## 5. Injeção de dependência e testabilidade

`montarAplicacao(config, overrides)` aceita substituições (`gerador`,
`catalogo`, `obterUptime`, `agora`). Nos testes de integração injetamos um
`GeradorEspiao` e um relógio fixo, tornando tudo determinístico. Nenhum teste faz
chamada real à IA — a exigência de **mock** é atendida pela própria arquitetura,
não por um *patch* improvisado.

## 6. Estratégia de testes e cobertura

- **Unitários**: casos de uso, config, prompt, classificação de erro transitório,
  decorador de retry e o adaptador Gemini (com o SDK mockado via `vi.mock`).
- **Integração**: a API Fastify inteira usando `app.inject`, com IA simulada —
  cobre sucesso, validações (`400`), falha de IA (`503`) e `404`.
- **Cobertura**: `@vitest/coverage-v8` com **limite mínimo de 70%** configurado em
  `vitest.config.ts` (linhas, funções, branches e statements). O pipeline falha
  se a cobertura cair. Valor atual: **~95%**.

## 7. CI/CD (GitHub Actions)

`.github/workflows/ci.yml` roda em cada push/PR para `main`:

1. **backend**: `npm ci` → `typecheck` → `test:coverage` (com `GEMINI_API_KEY`
   fictícia, pois a IA é mockada) → publica o relatório de cobertura.
2. **frontend**: `npm ci` → `build` (typecheck + bundle).

O badge verde no README reflete esse workflow.

## 8. Deploy

- **API** no **Render** via `render.yaml` (Blueprint): `rootDir: backend`,
  `build: npm ci && npm run build`, `start: npm start`, health check em
  `/saude`. Segredos (`GEMINI_API_KEY`, `CORS_ORIGIN`) ficam no painel.
- **Frontend** no **Vercel** (`frontend/vercel.json`): build estático do Vite;
  `VITE_API_URL` aponta para a URL pública do Render.

## 9. Rodando localmente

```bash
# Backend
cd backend && cp .env.example .env      # preencha GEMINI_API_KEY
npm install && npm run dev              # http://localhost:3000

# Frontend (outro terminal)
cd frontend && cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm install && npm run dev              # http://localhost:5173
```

## 10. Estrutura de pastas

```
backend/src
├── domain/            # entidades, erros, portas
├── application/       # casos de uso
├── infrastructure/    # Gemini, catálogo, config, retry
├── interfaces/http/   # Fastify, rotas, schemas, erros
├── composition.ts     # composition root
└── server.ts          # bootstrap

frontend/src
├── api/client.ts      # cliente HTTP tipado
├── components/        # Mascote, bolha de mensagem, sugestões
├── App.tsx            # tela de chat
└── main.tsx           # bootstrap React
```

## 11. Experiência do frontend (para o vídeo)

O frontend foi desenhado como uma "conversa com um mascote":

- **Mascote `Byte`** — um monitorzinho com olhos, feito em **SVG puro** e animado
  só com CSS. Ele tem quatro estados que reagem ao fluxo da conversa:
  `ocioso` (flutua), `pensando` (olhos para cima + bolhas de pensamento),
  `falando` (boca e ondas sonoras animadas) e `erro` (expressão de preocupação).
- **Efeito de "fala"** — a resposta da IA é **datilografada letra a letra** na
  bolha, sincronizada com o estado `falando` do mascote; ao terminar, o mascote
  volta para `ocioso`.
- **Animação de entrada** — cabeçalho, mascote, chat, sugestões e campo de
  texto entram em cascata (`animation-delay` escalonado).
- **Tema vivo** — fundo "aurora" com gradientes (ciano, coral, amarelo) que
  derivam lentamente; tokens de cor centralizados em `:root`.
- **Acessibilidade** — respeita `prefers-reduced-motion` (desliga animações e o
  efeito de digitação), usa `aria-live` no chat, `role="alert"` nos erros e
  mantém o texto completo em um `<span>` para leitores de tela mesmo durante a
  digitação.

> Demonstração: digite qualquer pergunta e observe o mascote **pensar** e depois
> **falar** enquanto a resposta aparece.

## 12. RAG, busca na web e controle de escopo

Três recursos que ampliam a qualidade das respostas **sem quebrar** quando algo
externo falha (degradação em cascata):

1. **RAG (retrieval-augmented generation)** — o caso de uso recupera trechos
   relevantes da base de conhecimento de hardware (`infrastructure/rag/documentos.ts`)
   e os injeta no *system prompt*. O recuperador é **híbrido**: tenta
   `RecuperadorVetorial` (embeddings `gemini-embedding-001` + similaridade de
   cosseno) e, se a cota/API falhar, cai para `RecuperadorLexical` (BM25
   simplificado, **sem nenhuma chamada de API**). Assim o RAG nunca fica fora do ar.
2. **Busca na web (Google Search grounding)** — quando `USAR_BUSCA_WEB=true`, a
   chamada inclui `tools: [{ googleSearch: {} }]`; as fontes retornadas em
   `groundingMetadata` viram links na resposta. Se a busca falhar (ex.: cota do
   plano gratuito), um *circuit breaker* desliga a busca e a resposta é refeita
   **sem ela**, apoiada no RAG.
3. **Controle de escopo** — o schema de saída inclui o campo booleano
   `assuntoDeTecnologia`. Se vier `false`, o backend devolve uma **recusa
   educada** padrão e nenhum produto — sem custo de chamada extra.

Cada etapa degrada de forma independente: busca → RAG vetorial → RAG lexical.
O pior caso ainda é uma resposta útil, só que menos fundamentada.
