# Dicionário de Dados

## Visão geral

O banco de dados do Portal de Solicitações Internas utiliza PostgreSQL e é versionado por Flyway.

Tabelas principais:

- `usuarios`
- `solicitacoes`

## Tabela `usuarios`

Armazena os usuários que podem acessar o sistema.

| Campo | Tipo | Obrigatório | Chave | Descrição |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | Sim | Primária | Identificador técnico do usuário. |
| `username` | `varchar(80)` | Sim | Única | Nome de usuário usado para login. |
| `password` | `varchar(255)` | Sim | Não | Senha armazenada com hash BCrypt. |
| `role` | `varchar(20)` | Sim | Não | Perfil do usuário. Valores: `USER`, `ADMIN`. |
| `created_at` | `timestamp` | Sim | Não | Data e hora de criação do usuário. |

Regras:

- `username` deve ser único.
- `password` nunca deve ser retornado pela API.
- `role` define permissões do usuário.

## Tabela `solicitacoes`

Armazena as solicitações internas registradas pelos usuários.

| Campo | Tipo | Obrigatório | Chave | Descrição |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | Sim | Primária | Identificador técnico da solicitação. |
| `codigo` | `varchar(20)` | Sim | Única | Código funcional exibido ao usuário, como `SOL-000001`. |
| `titulo` | `varchar(120)` | Sim | Não | Título resumido da solicitação. |
| `descricao` | `text` | Sim | Não | Descrição detalhada da solicitação. Limite validado pela aplicação: 10 a 500 caracteres. |
| `categoria` | `varchar(30)` | Sim | Não | Categoria da solicitação. |
| `status` | `varchar(30)` | Sim | Não | Status atual da solicitação. |
| `usuario_id` | `uuid` | Sim | Estrangeira | Usuário solicitante. Referencia `usuarios.id`. |
| `created_at` | `timestamp` | Sim | Não | Data e hora de abertura da solicitação. |
| `updated_at` | `timestamp` | Sim | Não | Data e hora da última atualização. |
| `deleted_at` | `timestamp` | Não | Não | Data e hora de exclusão lógica. Quando preenchido, a solicitação é considerada excluída. |

Categorias permitidas:

- `TI`
- `RH`
- `COMPRAS`
- `FINANCEIRO`
- `INFRAESTRUTURA`

Status permitidos:

- `ABERTO`
- `EM_ATENDIMENTO`
- `CONCLUIDO`

Regras:

- `codigo` é único e não deve ser reutilizado.
- `status` inicial é `ABERTO`.
- `deleted_at IS NULL` indica solicitação ativa.
- Solicitações com `deleted_at` preenchido não aparecem em listagens ou dashboard.
- Apenas solicitações abertas podem ser editadas ou excluídas.

## Relacionamentos

### `usuarios` 1:N `solicitacoes`

Um usuário pode possuir várias solicitações.

Uma solicitação pertence obrigatoriamente a um usuário.

Chave estrangeira:

```text
solicitacoes.usuario_id -> usuarios.id
```

## Índices

| Índice | Tabela | Campo | Finalidade |
| --- | --- | --- | --- |
| `idx_solicitacoes_usuario_id` | `solicitacoes` | `usuario_id` | Otimizar listagens por usuário. |
| `idx_solicitacoes_status` | `solicitacoes` | `status` | Otimizar filtros por status. |
| `idx_solicitacoes_categoria` | `solicitacoes` | `categoria` | Otimizar filtros por categoria. |
| `idx_solicitacoes_created_at` | `solicitacoes` | `created_at` | Otimizar ordenação e filtros por data. |
| `idx_solicitacoes_ativas` | `solicitacoes` | `deleted_at` | Otimizar consultas de registros ativos. |

## Regras de autorização relacionadas aos dados

### Perfil `USER`

Pode:

- Criar solicitações.
- Visualizar somente suas próprias solicitações.
- Editar somente suas próprias solicitações em status `ABERTO`.
- Excluir somente suas próprias solicitações em status `ABERTO`.

Não pode:

- Visualizar solicitações de outros usuários.
- Alterar status.

### Perfil `ADMIN`

- Visualizar todas as solicitações ativas.
- Visualizar detalhes de qualquer solicitação ativa.
- Alterar status.

## Fluxo de status

Fluxo válido:

```text
ABERTO -> EM_ATENDIMENTO -> CONCLUIDO
```

Transições inválidas:

```text
CONCLUIDO -> ABERTO
CONCLUIDO -> EM_ATENDIMENTO
EM_ATENDIMENTO -> ABERTO
ABERTO -> CONCLUIDO
```

## Dados de demonstração

A migration `V3__insert_demo_data.sql` cria:

Usuário administrador:

```text
username: admin
role: ADMIN
```

Usuário comum:

```text
username: usuario
role: USER
```

Também são inseridas solicitações de exemplo em diferentes categorias e status.

