-- Schema inicial — Castro Advocacia Plataforma
-- Aplicado automaticamente pelo Flyway na inicialização (perfil prod).

-- Usuarios
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    senha       VARCHAR(255) NOT NULL,
    sobrenome   VARCHAR(255),
    cargo       VARCHAR(255),
    foto_url    TEXT,
    perfil      VARCHAR(50) NOT NULL DEFAULT 'ATENDENTE',
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clientes
CREATE TABLE clientes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(255) NOT NULL,
    cpf             VARCHAR(20),
    numero_processo VARCHAR(255),
    status          VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- Servicos
CREATE TABLE servicos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero          INTEGER NOT NULL UNIQUE,
    titulo          VARCHAR(255) NOT NULL,
    tipo_servico    VARCHAR(255),
    valor_total     NUMERIC(12, 2),
    responsavel     VARCHAR(255),
    status          VARCHAR(255) NOT NULL DEFAULT 'Aberto',
    categoria       VARCHAR(255),
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- Processos (dados importados das planilhas)
CREATE TABLE processos (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria                   VARCHAR(255) NOT NULL,
    corretor                    VARCHAR(255),
    cliente                     VARCHAR(255),
    cpf                         VARCHAR(255),
    status                      VARCHAR(255),
    ano                         VARCHAR(255),
    mes                         VARCHAR(255),
    beneficio                   VARCHAR(255),
    tipo                        VARCHAR(255),
    fisico                      VARCHAR(255),
    protocolado                 VARCHAR(255),
    data_protocolo              VARCHAR(255),
    protocolo                   VARCHAR(255),
    concessao                   VARCHAR(255),
    aba                         VARCHAR(255),
    tarefas                     VARCHAR(2000),
    observacao                  VARCHAR(2000),
    numero_processo             VARCHAR(255),
    esp                         VARCHAR(255),
    vara                        VARCHAR(255),
    valor                       VARCHAR(255),
    data_movimentacao           VARCHAR(255),
    data_implantacao_beneficio  VARCHAR(255),
    criado_em                   TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em               TIMESTAMP DEFAULT NOW()
);
