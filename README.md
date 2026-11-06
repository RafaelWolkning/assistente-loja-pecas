# BytePeças — Loja de peças de PC com assistente de IA

![CI](https://github.com/RafaelWolkning/assistente-loja-pecas/actions/workflows/ci.yml/badge.svg?branch=main)
![Cobertura backend](https://img.shields.io/badge/cobertura%20backend-95%25-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D22-blue)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-lightgrey)

Loja fictícia de peças de computador com **vitrine de produtos** e um
**assistente de atendimento com IA (Google Gemini)**. O cliente navega pelo
catálogo, compara preços entre lojas parceiras e conversa com o **Byte** para
tirar dúvidas de compatibilidade e montagem.

> Projeto acadêmico. Produtos, preços e lojas são fictícios.

| | URL |
|---|---|
| **Aplicação (frontend)** | https://bytepecas-web.vercel.app |
| **API (backend)** | https://bytepecas-api.onrender.com |
| Saúde da API | https://bytepecas-api.onrender.com/saude |

> O plano gratuito do Render hiberna após alguns minutos. A primeira requisição
> pode levar ~30–50 s; a interface avisa quando o servidor está acordando.

## O que a aplicação faz

- **Vitrine de peças** — processadores, placas de vídeo, memórias, SSDs,
  monitores, periféricos e mais, com busca e filtro por categoria.
- **Cards com preço e disponibilidade** — ilustrações vetoriais de cada tipo de
  componente, preço à vista, parcela simulada e aviso de últimas unidades.
- **Atendimento com IA** — o Byte responde em linguagem natural usando o
  catálogo e uma base de conhecimento de hardware (RAG).
- **Comparação de preços** — cada produto sugerido no chat mostra uma tabela
  `Loja × Preço`, com o melhor preço destacado.
- **Escopo restrito** — o assistente só responde sobre computadores e
  tecnologia.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Fastify + TypeScript |
| IA | Google Gemini (`@google/genai`) |
| Testes | Vitest (backend e frontend) |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend) + Render (API) |

## Arquitetura em uma frase

O frontend consome uma API HTTP; a API organiza o backend em **camadas** e
conversa com o Gemini **atrás de uma interface (porta)**, o que permite testar
tudo com a IA simulada.

```
frontend (React)  ──HTTP/JSON──▶  backend (Fastify)
                                     │
                                     ├── application (casos de uso)
                                     ├── domain (entidades + portas)
                                     ├── infrastructure (Gemini, catálogo, RAG)
                                     └── interfaces/http (rotas)
                                              │
                                              ▼
                                       Google Gemini
```

### O que cada pasta faz

```
backend/
├── src/
│   ├── domain/          # Entidades (Produto, Mensagem), erros e portas/interfaces
│   ├── application/     # Casos de uso: listar produtos, perguntar, saúde
│   ├── infrastructure/  # Adaptadores: Gemini, catálogo, preços, RAG, config
│   ├── interfaces/http/ # Fastify: rotas, schemas e tratamento de erros
│   ├── composition.ts   # Monta o grafo de dependências (composition root)
│   └── server.ts        # Sobe o servidor
└── test/                # Testes unitários e de integração (IA mockada)

frontend/
├── src/
│   ├── api/client.ts    # Cliente HTTP tipado da API
│   ├── components/      # Vitrine, cards, mascote, chat, ilustrações SVG
│   ├── utils/           # Formatação de preços em BRL
│   ├── App.tsx          # Home: catálogo + assistente
│   ├── main.tsx         # Bootstrap do React
│   └── styles.css       # Tema visual e responsividade
├── test/                # Testes dos componentes e do cliente HTTP
└── index.html           # HTML base
```

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Metadados da API |
| `GET` | `/saude` | Saúde/status |
| `GET` | `/produtos` | Catálogo de peças |
| `POST` | `/perguntar` | Pergunta ao assistente de IA |

```bash
curl -X POST http://localhost:3000/perguntar \
  -H "Content-Type: application/json" \
  -d '{"pergunta":"Quero um monitor bom para jogar"}'
```

## Como rodar localmente

Pré-requisitos: Node.js ≥ 22 e uma chave do
[Google AI Studio](https://aistudio.google.com/app/apikey).

```bash
# Backend
cd backend
cp .env.example .env      # preencha GEMINI_API_KEY
npm install
npm run dev               # http://localhost:3000

# Frontend (outro terminal)
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm install
npm run dev               # http://localhost:5173
```

## Testes e CI

```bash
# Backend (cobertura mínima de 70%, IA mockada)
cd backend && npm run test:coverage

# Frontend (componentes da vitrine, cards, cliente HTTP e home)
cd frontend && npm test
```

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) roda a cada
push/PR para `main`:

1. **backend:** typecheck + testes com cobertura.
2. **frontend:** testes + typecheck + build.

## Segurança

- Nenhuma chave é versionada: `.env` fica no `.gitignore` e o repositório traz
  apenas `.env.example`.
- Em produção, a chave vive nas variáveis de ambiente do Render.
- O CI usa uma chave fictícia porque a IA é simulada nos testes.

## Documentação extra

- [`ARQUITETURA.md`](./ARQUITETURA.md) — detalhes das camadas e passo a passo.
- [`DECISOES.md`](./DECISOES.md) — justificativa das escolhas técnicas.

## Licença

MIT.