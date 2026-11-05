# Assistente de Atendimento — BytePeças

Assistente de atendimento com **IA Generativa (Google Gemini)** para uma loja
fictícia de peças de computador. O cliente digita uma pergunta e a IA responde
no papel de atendente da loja.

> **Status do projeto:** em construção. O README completo (com badge de CI,
> arquitetura, instruções de execução e URLs de deploy) é adicionado ao final.

## Estrutura

```
.
├── backend/     # API (Node + TypeScript + Fastify), arquitetura em camadas
├── frontend/    # Interface web (React + Vite)
└── .github/     # Pipeline CI/CD (GitHub Actions)
```

## Documentação

- [`ARQUITETURA.md`](./ARQUITETURA.md) — decisões de arquitetura e passo a passo.
- [`DECISOES.md`](./DECISOES.md) — por que esta stack e o que foi aprendido.
- [`docs/intent/`](./docs/intent) — intenção confirmada do projeto.
