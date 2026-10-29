-- ============================================================
-- Schema PostgreSQL — Castro Advocacia Plataforma
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE IF NOT EXISTS clientes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome            VARCHAR(255) NOT NULL,
    cpf             VARCHAR(20),
    numero_processo VARCHAR(255),
    status          VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- Servicos
CREATE TABLE IF NOT EXISTS servicos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE IF NOT EXISTS processos (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================================
-- Usuario admin padrão (senha: castro2025)
-- TROQUE a senha após o primeiro login!
-- ============================================================
INSERT INTO usuarios (id, nome, email, senha, perfil, criado_em)
VALUES (
    '55555555-5555-5555-5555-555555555501',
    'Usuário Adm',
    'admin@castroadvocacia.com',
    '$2a$10$wWeEuVw7LHdJsVYrSCdVBeEu8l5XN2Mq8NXxHqMOtR82KOdcrzGQG',
    'ADMIN',
    NOW()
) ON CONFLICT (id) DO NOTHING;
