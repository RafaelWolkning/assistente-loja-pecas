# Intenção confirmada — Assistente de Atendimento (BytePeças)

Documento produzido via processo de entrevista (`interview-me`) antes de
qualquer linha de código. Registra o que o projeto **é** e o que **não é**.

## Statement of Intent

- **Outcome:** mini-app web pública em que o cliente digita uma pergunta e o
  Gemini responde como atendente de uma loja fictícia de peças de computador;
  entregue com API em camadas, testes, CI/CD e deploy documentados.
- **User:** cliente da loja (usuário final); discente/professor (avaliação da nota).
- **Why now:** entrega única de 100 pontos, prazo **7/nov/2026**, precisa estar
  online e demonstrável em vídeo de 5–8 minutos.
- **Success:** repo público `/backend` + `/frontend`, README + `.env.example`;
  API `POST /perguntar` + `GET /saude` (+ extras); UI conectada; testes **≥70%**
  de cobertura com IA **mockada**; **GitHub Actions verde** com badge; **URL
  pública** (Render + Vercel); **zero chave** no código/histórico; **commits
  frequentes**; `DECISOES.md` (≥200 palavras) + `ARQUITETURA.md` passo a passo.
- **Constraint:** ~3 dias; apenas free tiers; chave só via `.env`/secret; sem
  localhost na entrega.
- **Out of scope:** banco de dados, catálogo/pedidos/pagamento reais,
  login/usuários, RAG sobre estoque real e a gravação do vídeo.

## Stack decidida

TypeScript full-stack: backend Node/Fastify (arquitetura em camadas) +
frontend React/Vite; deploy em Render (API) + Vercel (frontend); CI no
GitHub Actions.
