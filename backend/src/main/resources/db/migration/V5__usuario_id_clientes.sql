-- Isolamento de clientes por usuário, no mesmo padrão de processos e servicos.
-- Clientes existentes ficam com NULL (legado, visível para todos os usuários).
ALTER TABLE clientes ADD COLUMN usuario_id UUID;
