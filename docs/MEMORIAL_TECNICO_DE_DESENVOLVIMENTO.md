# Memorial Técnico de Desenvolvimento

## Visão geral

O Portal de Solicitações Internas foi desenvolvido como uma aplicação full stack para centralizar demandas internas de áreas como TI, RH, Compras, Financeiro e Infraestrutura.

A solução prioriza funcionamento completo, organização simples, segurança básica, validação de dados, interface responsiva e documentação suficiente para execução e manutenção local.

## Decisões de arquitetura

O backend segue MVC com separação direta de responsabilidades:

```text
Controller -> Service -> Repository -> JPA/Hibernate -> PostgreSQL
```

Essa estrutura foi escolhida porque atende bem ao tamanho do projeto sem criar camadas artificiais. A regra de negócio fica nos services, os controllers cuidam de entrada e saída HTTP, e os repositories ficam restritos ao acesso a dados.

Não foram adotados microserviços, mensageria, cache distribuído, CQRS, Event Sourcing ou arquitetura hexagonal completa porque o domínio é pequeno e local. Essas escolhas aumentariam complexidade sem ganho proporcional.

## Backend

O backend utiliza Java 21 e Spring Boot por serem tecnologias maduras para APIs corporativas, com bom suporte a segurança, validação, persistência e testes.

Principais responsabilidades:

- Autenticar usuários com JWT.
- Proteger endpoints com Spring Security.
- Aplicar regras de autorização por perfil.
- Gerenciar solicitações com UUID e código funcional.
- Aplicar soft delete.
- Controlar transições de status.
- Expor documentação via Swagger.
- Validar entradas com Bean Validation.
- Padronizar tratamento de erros.

## Organização do backend

Pacotes principais:

- `controller`: endpoints HTTP.
- `service`: regras de negócio e autorização de domínio.
- `repository`: acesso ao banco.
- `entity`: modelo persistido.
- `dto`: contratos de entrada e saída da API.
- `enums`: categorias, status e roles.
- `security`: JWT, filtro de autenticação, configuração de segurança.
- `exception`: exceções e tratamento global.
- `config`: configurações auxiliares.

Entidades JPA não são expostas diretamente pela API. Os endpoints retornam DTOs específicos para cada caso.

## Banco de dados

O banco escolhido foi PostgreSQL por ser robusto, amplamente utilizado e adequado para aplicações transacionais simples.

As alterações estruturais são controladas com Flyway. Isso evita depender de `ddl-auto=create` e torna a evolução do schema versionada.

O Hibernate está configurado com `ddl-auto=validate`, garantindo que a aplicação valide o schema esperado sem criar ou alterar tabelas automaticamente.

## Modelagem

O modelo possui duas tabelas principais:

- `usuarios`
- `solicitacoes`

Os identificadores técnicos usam UUID, evitando acoplamento com sequências numéricas como chave primária.

A solicitação também possui um código funcional único no formato:

```text
SOL-000001
```

Esse código é voltado ao usuário final e não substitui o UUID técnico.

## Soft delete

A exclusão de solicitações é lógica. O campo `deleted_at` é preenchido quando a solicitação é excluída.

Solicitações excluídas:

- Não aparecem em listagens.
- Não entram nos indicadores do dashboard.
- Não podem ser editadas.
- Não podem ter status alterado.
- Não podem ser excluídas novamente.

Essa abordagem preserva histórico e evita perda física de dados.

## Regras de autorização

Existem dois perfis:

- `USER`
- `ADMIN`

Usuários comuns podem criar solicitações, visualizar as próprias, editar as próprias quando estiverem abertas e excluir as próprias quando estiverem abertas.

Administradores podem visualizar todas as solicitações ativas e alterar status. A edição de conteúdo continua restrita ao proprietário, preservando a separação entre alterar dados da solicitação e gerenciar seu andamento.

## Regras de status

O fluxo permitido é:

```text
ABERTO -> EM_ATENDIMENTO -> CONCLUIDO
```

Retrocesso de status não é permitido. A validação fica no service, pois é regra de negócio do domínio.

## Segurança

A autenticação usa JWT stateless. O login retorna token Bearer, tempo de expiração e dados básicos do usuário.

Senhas são armazenadas com BCrypt. O segredo do JWT, dados de banco e origens CORS são configuráveis por variáveis de ambiente.

O CORS é restrito às origens configuradas. O frontend pode esconder ações conforme perfil, mas a autorização real é sempre validada no backend.

## Tratamento de erros

O backend utiliza tratamento global com `@RestControllerAdvice`, retornando respostas padronizadas para validações, regras de negócio, erros de permissão, recursos inexistentes e erros inesperados.

Essa decisão evita stack traces no cliente e mantém respostas consistentes para o frontend.

## Frontend

O frontend utiliza React, TypeScript, Vite e Tailwind CSS.

O TanStack Router é usado somente para roteamento no navegador. A aplicação permanece como SPA Vite, pois não precisa de SSR, server functions ou estrutura full-stack no frontend.

## Organização do frontend

Pastas principais:

- `components`: componentes reutilizáveis.
- `layouts`: estrutura visual da aplicação.
- `pages`: telas.
- `services`: chamadas HTTP centralizadas.
- `schemas`: validações com Zod.
- `contexts`: estado de autenticação.
- `types`: tipos compartilhados.
- `utils`: formatações e auxiliares.
- `tests`: testes automatizados do frontend, separados do código da aplicação.

As chamadas HTTP ficam nos services, evitando requisições espalhadas pelas telas.

## Formulários e validação

Os formulários usam React Hook Form com Zod quando aplicável.

O frontend valida campos obrigatórios, limites e formatos para melhorar a experiência do usuário, mas as validações do backend continuam sendo a fonte de verdade.

## Comunicação frontend/backend

O frontend consome a API através de `VITE_API_URL`.

O token JWT é enviado nas requisições autenticadas. Erros HTTP são tratados por uma camada central de API para manter comportamento consistente.

## Responsividade

A interface foi ajustada para desktop e mobile. As telas de dashboard, listagem, detalhes e modais usam classes responsivas do Tailwind.

No mobile, tabelas são apresentadas como cards para facilitar leitura e ações. Títulos longos são truncados para evitar quebra visual.

## Docker

O projeto possui Dockerfiles para backend e frontend e um `docker-compose.yml` com:

- PostgreSQL
- Backend
- Frontend

Essa composição permite execução local com um único comando e reduz dependências manuais para avaliação.

## CI/CD

O workflow `.github/workflows/ci-cd.yml` executa:

- Testes automatizados do backend.
- Lint e build do frontend.
- Validação e build do Docker Compose.

Como não há deploy público exigido, a entrega contínua valida o empacotamento Docker, garantindo que a aplicação possa ser construída para execução local.

## Testes

Os testes priorizam regras relevantes:

- Criação de solicitações.
- Edição de solicitações abertas.
- Exclusão com soft delete.
- Permissões de usuário e administrador.
- Alteração de status.
- Transições inválidas.
- Solicitação inexistente.
- Filtros.
- Dashboard.
- Respostas principais do controller.
- Validações e componentes reutilizáveis do frontend.
- Camada de API do frontend.

Não foram criados testes artificiais em excesso; a cobertura foi direcionada às regras centrais do desafio.

## Alternativas consideradas

Foi considerada uma estrutura com renderização no servidor, mas ela não foi adotada porque o projeto exige React com Vite e não precisa de SSR. A alternativa simples com Vite SPA ficou mais coerente com o escopo.

Também foram evitadas tecnologias como Redis, Kafka, Keycloak, Kubernetes e cloud pública, pois não resolvem problemas reais deste mini-projeto.

## Limitações

- Não há cadastro público de usuários.
- Os usuários de demonstração são inseridos por migration.
- Não há upload de anexos.
- Não há trilha completa de auditoria de todas as alterações.
- O frontend possui testes automatizados iniciais, mas ainda não possui testes end-to-end com navegador real.
- O deploy público não faz parte do escopo.

## Melhorias futuras

- Ampliar testes automatizados para fluxos completos do frontend.
- Adicionar testes end-to-end com Playwright.
- Adicionar auditoria de alterações de status.
- Implementar cadastro administrativo de usuários.
- Adicionar anexos às solicitações.
- Melhorar métricas do dashboard.
- Adicionar paginação avançada e exportação.

## Produção

Em um ambiente de produção, seria recomendável:

- Usar secrets gerenciados fora do repositório.
- Configurar HTTPS.
- Utilizar banco gerenciado ou instância PostgreSQL com backup.
- Adicionar logs estruturados.
- Configurar observabilidade básica.
- Separar perfis de ambiente.
- Publicar imagens Docker em registry privado.
- Executar migrations em estratégia controlada de release.
