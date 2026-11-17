-- Coluna JSON para armazenar TODAS as colunas da planilha importada
ALTER TABLE processos ADD COLUMN dados TEXT;

-- Metadados das colunas detectadas por categoria/usuário
CREATE TABLE planilha_meta (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria   VARCHAR(255) NOT NULL,
    usuario_id  UUID,
    colunas     TEXT NOT NULL,
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);
