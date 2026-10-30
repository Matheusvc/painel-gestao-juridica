# Migrations do banco (Flyway)

O schema do PostgreSQL de produção é gerenciado pelo [Flyway](https://documentation.red-gate.com/fd). Toda alteração no banco (tabela, coluna, índice, dado inicial) é feita por um arquivo SQL versionado, aplicado automaticamente quando a aplicação sobe no perfil `prod`.

| Perfil | Banco | Como o schema é criado |
|---|---|---|
| `dev` | H2 em memória | Hibernate gera a partir das entidades (`ddl-auto: create`) + `data.sql`. Flyway desligado. |
| `prod` | PostgreSQL | Flyway aplica as migrations; Hibernate só valida (`ddl-auto: validate`). |

## Passo a passo

### 1. Criar o arquivo

Pasta: `backend/src/main/resources/db/migration/`

Nome: `V<número>__<descricao>.sql`

```
V3__adicionar_telefone_cliente.sql
```

- `V` maiúsculo + próximo número + **dois** underscores + descrição.
- Use o número seguinte ao maior que já existe na pasta.

### 2. Escrever o SQL (PostgreSQL)

```sql
ALTER TABLE clientes ADD COLUMN telefone VARCHAR(20);
CREATE INDEX idx_clientes_cpf ON clientes (cpf);
```

### 3. Atualizar a entidade

```java
@Column(length = 20)
private String telefone;
```

Em produção o Hibernate roda com `ddl-auto: validate`: se a entidade não bater com a tabela, **a aplicação não sobe**. No dev (H2) o schema é gerado a partir das entidades, então a mudança aparece sozinha.

### 4. Testar contra um PostgreSQL de verdade

O perfil `dev` usa H2 com Flyway desligado, então `mvn spring-boot:run` sozinho **não executa as migrations**. Para testar:

```bash
podman run -d --name pg-test -p 5432:5432 \
  -e POSTGRES_DB=castro -e POSTGRES_USER=castro -e POSTGRES_PASSWORD=pw \
  postgres:16-alpine

cd backend
SPRING_PROFILES_ACTIVE=prod \
DATABASE_URL=jdbc:postgresql://localhost:5432/castro \
DATABASE_USER=castro DATABASE_PASSWORD=pw \
mvn spring-boot:run
```

(`docker` funciona igual, trocando `podman` por `docker`.)

No log, procure `Successfully applied N migrations` seguido de `Started PlataformaApplication`. Depois, remova o banco de teste:

```bash
podman rm -f pg-test
```

### 5. Deploy

Commit e push na `master`. O workflow `.github/workflows/deploy.yml` faz o deploy no CapRover e, ao subir, o Flyway aplica só as migrations que a produção ainda não rodou (o controle fica na tabela `flyway_schema_history`).

Se uma migration falhar, o PostgreSQL desfaz a transação e o banco continua como estava, mas a nova versão não sobe. Corrija o SQL e faça push de novo.

## Regras

- **Nunca edite uma migration que já rodou em produção.** O Flyway confere o checksum de cada arquivo e recusa subir se algum mudou. Para corrigir, crie uma nova (V4, V5…).
- **Nunca reutilize nem pule números.** Cada versão é única.
- **Faça backup antes de mudanças destrutivas** (`DROP`, renomear coluna, mudar tipo):

  ```bash
  pg_dump -h <host> -U <usuario> -d <banco> -Fc -f backup_$(date +%F).dump
  ```

- **Coluna `NOT NULL` em tabela com dados:** dê um `DEFAULT`, ou crie como nullable, preencha e só depois adicione `NOT NULL`.

  ```sql
  ALTER TABLE servicos ADD COLUMN prioridade VARCHAR(20) NOT NULL DEFAULT 'NORMAL';
  ```

- **Renomear coluna** exige SQL + entidade no mesmo deploy:

  ```sql
  ALTER TABLE clientes RENAME COLUMN numero_processo TO processo_numero;
  ```

  ```java
  @Column(name = "processo_numero")
  private String numeroProcesso;
  ```

## Exemplos comuns

```sql
-- Nova tabela
CREATE TABLE anotacoes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id  UUID NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
    texto       TEXT NOT NULL,
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mudar tamanho de coluna
ALTER TABLE clientes ALTER COLUMN cpf TYPE VARCHAR(30);

-- Remover coluna (faça backup antes)
ALTER TABLE processos DROP COLUMN aba;

-- Ajuste de dados
UPDATE servicos SET status = 'Aberto' WHERE status IS NULL;
```

## Migrations existentes

| Versão | Arquivo | O que faz |
|---|---|---|
| V1 | `V1__schema_inicial.sql` | Cria `usuarios`, `clientes`, `servicos`, `processos` |
| V2 | `V2__usuario_admin_padrao.sql` | Cria o admin padrão (`admin@castroadvocacia.com`) |
