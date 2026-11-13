-- Adicionar coluna usuario_id nas tabelas processos e servicos
-- para isolamento de dados por usuário.
-- Dados existentes ficam com NULL (legado, visível para todos os usuários).

ALTER TABLE processos ADD COLUMN usuario_id UUID;
ALTER TABLE servicos  ADD COLUMN usuario_id UUID;
