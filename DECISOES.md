# Decisões de projeto — BytePeças

Este documento registra **o porquê** das escolhas técnicas e o que aprendi no
processo, conforme exigido no trabalho.

## Por que TypeScript full-stack

Optei por **TypeScript nos dois lados** (backend e frontend). A razão principal
é o contrato da API: o mesmo modelo mental de tipos viaja do servidor para o
navegador, reduzindo erros de integração e deixando explícito o formato das
mensagens (`pergunta`, `historico`, `resposta`). Em um projeto de IA, onde a
resposta é texto livre, ter o resto do fluxo fortemente tipado dá segurança
justamente na única parte que não é tipada.

## Por que Fastify (e não Express)

O **Fastify** oferece validação de schema (JSON Schema) nativa por rota e um
sistema de plugins previsível. Isso permitiu validar o corpo de `POST
/perguntar` sem adicionar uma dependência de validação, e ainda retornar erros
`400` consistentes. Fastify também é mais rápido e tem logging estruturado
nativo, útil para um serviço que fala com um provedor externo.

## Por que arquitetura em camadas (portas e adaptadores)

A regra de negócio não deveria depender do Gemini. Criei uma **porta**
(`RespostaGenerator`) no domínio e um **adaptador** (`GeminiRespostaGenerator`)
na infraestrutura. O caso de uso `PerguntarUseCase` conhece apenas a interface.
Isso trouxe dois ganhos concretos: (1) os testes simulam a IA com um fake, sem
rede nem chave — o que atende à exigência de mock do trabalho; (2) trocar Gemini
por OpenAI seria substituir um único arquivo, sem tocar em domínio ou HTTP.

## Por que o frontend no Vercel e a API no Render

Separei as duas responsabilidades de deploy. O frontend é estático (Vite), então
o Vercel o serve de forma global e instantânea. A API roda como Web Service no
Render, que é a forma mais "clássica" de expor endpoints HTTP e casa com a
exigência do trabalho. Como o plano gratuito do Render hiberna, adicionei um
`GET /saude`, uso-o para health check e o frontend o consulta ao carregar
(warm-up), mostrando "servidor acordando" se necessário.

## Resiliência com o provedor de IA

Durante o desenvolvimento observei erros `503` e `429` (limite do free tier).
Em vez de deixar a aplicação quebrar, encapsulei um **decorador de
retentativas** (`GeradorComRetentativas`) com backoff exponencial, que só
retenta erros transitórios. O adaptador traduz falhas do provedor em
`ErroDeIntegracaoIA`, que a camada HTTP converte em `503` com mensagem amigável.

## Por que saída estruturada (JSON Schema) e comparação simulada

Pedir texto livre à IA e depois "adivinhar" o que ela disse seria frágil. Em vez
disso, uso **saída estruturada** (`responseMimeType: application/json` +
`responseJsonSchema`): o modelo devolve `mensagem` + `produtos[]`, e o backend
enriquece cada produto com a **comparação de preços**. Assim a interface monta
tabelas de verdade (Loja × Preço), e os testes continuam mockando a IA — nada de
fazer *parsing* de texto solto.

Foi uma **decisão explícita usar lojas fictícias e preços simulados**: inventar
preços de varejistas reais seria enganoso, ainda mais em um trabalho acadêmico. O
comparador é **determinístico** (hash do nome do produto + loja), então a mesma
pergunta devolve sempre a mesma tabela — ótimo para demonstração e para testes.
Trocar por dados de preços reais é substituir um único adaptador, sem tocar em
domínio, casos de uso ou frontend.

Também abri o conhecimento do atendente para **toda a tecnologia** (monitores,
periféricos, notebooks, redes), em vez de restringi-lo ao catálogo: quando o item
existe no catálogo, uso o preço real da loja; quando não existe, a IA estima um
preço e a resposta é marcada como "estimativa".

## O que aprendi

Aprendi a manter o SDK de IA isolado em uma borda do sistema, a usar injeção de
dependência para tornar casos de uso testáveis sem rede, e a importância de
selecionar o modelo certo — descobri que `gemini-2.5-flash` foi descontinuado
para novos usuários e migrei para `gemini-3.5-flash-lite`. Também reforcei
cuidados com segredos: a chave vive apenas em `.env` (ignorado) e em variáveis
de ambiente da plataforma, nunca no histórico do Git.
