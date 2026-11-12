# Castro Advocacia — Painel de Gestão

Painel administrativo para o escritório Castro Advocacia. Controle de clientes, processos, corretores, serviços e importação de planilhas.

## Estrutura

```
├── frontend/            React 18 + TypeScript + Tailwind CSS + Vite
│   └── src/
│       ├── components/
│       │   ├── dashboard/     Gráficos, KPIs, exportação de relatórios
│       │   ├── layout/        Sidebar, topbar, avatar, navegação
│       │   ├── pages/         Dashboard, Clientes, Corretores, Serviços, Importar, Usuários
│       │   ├── ui/            Botões, modais, inputs, tags de status
│       │   ├── clientes/      Formulário de cliente
│       │   └── servicos/      Formulário de serviço
│       ├── hooks/             useFetch, useHashRoute, useClickOutside
│       ├── lib/               API client, utilitários (charts, download, currency)
│       ├── context/           Auth (JWT) e tema
│       └── types/             Tipagens das entidades
│
├── backend/             Java 21 + Spring Boot 3.4 + PostgreSQL
│   └── src/main/java/com/castroadvocacia/plataforma/
│       ├── model/             Entidades JPA (Cliente, Processo, Servico, Usuario)
│       ├── repository/        Repositórios Spring Data
│       ├── service/           Lógica de negócio (Dashboard, Import, Cliente, Servico)
│       ├── controller/        Endpoints REST (/api/*)
│       ├── dto/               Data Transfer Objects
│       ├── config/            CORS, Security, exception handler
│       ├── security/          JWT, autenticação, rate limiting
│       └── util/              Utilitários
│
├── docker-compose.yml   Deploy com Docker (frontend + backend + PostgreSQL)
└── schema-supabase.sql  Schema do banco para Supabase
```

## Como rodar

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

API em `http://localhost:8080`. No perfil dev usa H2 em memória.

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável            | Descrição                   |
| ------------------- | --------------------------- |
| `DATABASE_URL`      | URL de conexão PostgreSQL   |
| `DATABASE_USER`     | Usuário do banco            |
| `DATABASE_PASSWORD` | Senha do banco              |
| `JWT_SECRET`        | Chave secreta para tokens   |

### Docker

```bash
docker compose up -d
```

## Stack

| Camada   | Tecnologia                                     |
| -------- | ---------------------------------------------- |
| Frontend | React 18, TypeScript, Tailwind CSS 3, Vite 5   |
| Backend  | Java 21, Spring Boot 3.4, Spring Security, JPA |
| Banco    | PostgreSQL (prod) / H2 (dev)                   |
| Auth     | JWT + BCrypt                                    |
| Deploy   | Docker Compose / CapRover                       |

## Funcionalidades

- **Dashboard** — KPIs, gráficos de evolução mensal, receita por mês, distribuição por corretor e status. Filtro por competência.
- **Clientes** — Listagem, busca, cadastro e edição de clientes.
- **Corretores** — Detalhamento por corretor com KPIs, gráficos de status/benefício e tabela de clientes.
- **Serviços** — Gestão de serviços com filtros por planilha, status e corretor. Exportação CSV.
- **Importar** — Upload de planilhas .xlsx para alimentar o sistema.
- **Usuários** — CRUD de usuários do painel.
- **Relatórios** — Exportação em CSV e impressão/PDF para dashboard e corretores.
