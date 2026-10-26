-- ============================================================
-- Seed data: espelha os mocks do frontend
-- ============================================================

-- Clientes
INSERT INTO clientes (id, nome, cpf, numero_processo, status, criado_em, atualizado_em) VALUES
  ('11111111-1111-1111-1111-111111111101', 'André Costa',     '123.456.789-00', '0001234-56.2025.8.26.0100', 'ATIVO',    NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111102', 'Julia Maria',     '234.567.890-11', '0002345-67.2025.8.26.0100', 'ATIVO',    NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111103', 'Aline Souza',     '345.678.901-22', '0003456-78.2025.8.26.0100', 'ATIVO',    NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111104', 'Marcelo Andrade', '456.789.012-33', '0004567-89.2025.8.26.0100', 'ATIVO',    NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111105', 'Suzane Moura',    '567.890.123-44', '0005678-90.2025.8.26.0100', 'PENDENTE', NOW(), NOW());

-- Servicos
INSERT INTO servicos (id, numero, titulo, tipo_servico, valor_total, responsavel, status, criado_em, atualizado_em) VALUES
  ('22222222-2222-2222-2222-222222222201', 1, 'Computador não liga',                  'Manutenção de Hardware', 150.00, 'Carlos Silva', 'EM_ANDAMENTO', '2025-04-12 09:01:00', '2025-04-12 09:01:00'),
  ('22222222-2222-2222-2222-222222222202', 2, 'Instalação de software de gestão',     'Suporte de Software',   200.00, 'Ana Oliveira', 'CONCLUIDO',    '2025-04-10 10:15:00', '2025-04-10 10:15:00'),
  ('22222222-2222-2222-2222-222222222203', 3, 'Rede lenta',                           'Instalação de Rede',    180.00, 'Carlos Silva', 'ABERTO',       '2025-04-13 20:56:00', '2025-04-13 20:56:00'),
  ('22222222-2222-2222-2222-222222222204', 4, 'Backup não está funcionando',          'Recuperação de Dados',  200.00, 'Carlos Silva', 'ABERTO',       '2025-04-12 15:20:00', '2025-04-12 15:20:00'),
  ('22222222-2222-2222-2222-222222222205', 5, 'Meu fone não conecta no computador',  'Suporte de Software',    80.00, 'Ana Oliveira', 'CONCLUIDO',    '2025-04-11 15:16:00', '2025-04-11 15:16:00'),
  ('22222222-2222-2222-2222-222222222206', 6, 'Solicitação de upgrade de servidor',   'Consultoria de TI',     350.00, 'Carlos Silva', 'EM_ANALISE',   '2025-04-14 11:40:00', '2025-04-14 11:40:00');

-- Usuario admin padrao
INSERT INTO usuarios (id, nome, email, senha, perfil, criado_em) VALUES
  ('55555555-5555-5555-5555-555555555501', 'Usuário Adm', 'user.adm@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NOW());
