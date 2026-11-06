Escolhi utilizar TypeScript tanto no frontend quanto no backend por facilitar a comunicação entre as duas partes e ajudar a evitar erros. Também já tenho experiência com .NET, Angular e TypeScript por atuar como Arquiteto .NET, então pude aproveitar conhecimentos que já utilizo no meu trabalho.

Para o backend, escolhi o Fastify por ser simples e rápido. Também organizei o projeto em camadas para facilitar a manutenção e permitir futuras mudanças, como trocar o serviço de IA sem precisar alterar grande parte do sistema.

Para hospedar o projeto, utilizei o Vercel no frontend e o Render no backend, principalmente pela facilidade de configuração e pelas opções gratuitas.

Na integração com o Gemini, utilizei respostas em JSON para facilitar a leitura e comparação dos produtos. Também implementei RAG para melhorar as respostas com informações sobre hardware e compatibilidade.

Optei por utilizar lojas fictícias e preços simulados para não apresentar valores inventados como se fossem reais. Quando não encontra um produto, o sistema pode apresentar uma estimativa, deixando isso claro para o usuário.

Durante o desenvolvimento, aprendi mais sobre Fastify, testes automatizados, integração com inteligência artificial e tratamento de erros. Também precisei lidar com limites de requisições da API do Gemini, criando alternativas para evitar que o sistema pare de funcionar.

Por fim, utilizei variáveis de ambiente para proteger as chaves de API e evitar que informações sensíveis fossem expostas no código.

No geral, o projeto foi uma oportunidade de colocar em prática minha experiência profissional, conhecer melhor algumas tecnologias e desenvolver uma aplicação completa, desde o código até a hospedagem.
