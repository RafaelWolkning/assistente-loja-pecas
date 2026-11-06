# Decisões 

Escolhi utilizar TypeScript no frontend e no backend porque facilita a comunicação entre as duas partes do sistema e ajuda a evitar erros, já que permite definir os tipos de dados utilizados. Para o backend, optei pelo Fastify por ser simples, rápido e oferecer validação de dados nas rotas.

Também organizei o projeto em camadas, separando as regras de negócio da integração com o Gemini. Fiz isso para facilitar a manutenção e permitir trocar o serviço de IA no futuro sem precisar modificar grande parte do código. Essa organização também ajudou nos testes, pois consegui simular as respostas da IA sem depender de chamadas reais à API.

Para a hospedagem, escolhi o Vercel para o frontend e o Render para o backend, pois são plataformas que atendem bem às necessidades do projeto e possuem opções gratuitas.

Na integração com a IA, utilizei respostas estruturadas em JSON para facilitar a leitura dos produtos e a montagem das tabelas de comparação. Também implementei um sistema de RAG para melhorar as respostas com informações sobre hardware, compatibilidade e especificações técnicas. Além disso, utilizei uma busca alternativa por palavras-chave caso a busca vetorial falhe.

Uma decisão importante foi utilizar lojas fictícias e preços simulados, evitando apresentar valores inventados como se fossem preços reais. Quando um produto não está cadastrado, a IA pode fornecer uma estimativa, deixando isso claro para o usuário.

Durante o desenvolvimento, aprendi bastante sobre TypeScript, Fastify, organização de código, injeção de dependência, testes automatizados e integração com APIs de inteligência artificial. Também tive que lidar com problemas de limite de requisições do Gemini, erros 429 e 503, o que me ensinou a criar alternativas para que o sistema continue funcionando mesmo quando um serviço externo apresenta falhas.

Por fim, aprendi a importância de proteger informações sensíveis, utilizando variáveis de ambiente para armazenar as chaves de API, sem expô-las no código ou no GitHub.

De forma geral, o projeto me ajudou a entender melhor como desenvolver uma aplicação completa, desde a escolha das tecnologias até a hospedagem e os cuidados necessários para mantê-la funcionando.
