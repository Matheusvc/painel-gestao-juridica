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

-- Conversas
INSERT INTO conversas (id, nome_contato, cargo_contato, online, nao_lidas, criado_em, atualizado_em) VALUES
  ('33333333-3333-3333-3333-333333333301', 'André Costa',     'Cliente', TRUE,  2, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333302', 'Julia Maria',     'Cliente', TRUE,  0, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333303', 'Marcelo Andrade', 'Cliente', FALSE, 1, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333304', 'Aline Souza',     'Cliente', FALSE, 0, NOW(), NOW());

-- Mensagens da conversa 1 (André Costa)
INSERT INTO mensagens (id, texto, autor, conversa_id, criado_em) VALUES
  ('44444444-4444-4444-4444-444444444401', 'Olá! Escolhi falar com um atendente, pode me ajudar?',              'CLIENTE',    '33333333-3333-3333-3333-333333333301', DATEADD('MINUTE', -8, NOW())),
  ('44444444-4444-4444-4444-444444444402', 'Gostaria de saber como está o andamento do meu processo.',          'CLIENTE',    '33333333-3333-3333-3333-333333333301', DATEADD('MINUTE', -2, NOW()));

-- Mensagens da conversa 2 (Julia Maria)
INSERT INTO mensagens (id, texto, autor, conversa_id, criado_em) VALUES
  ('44444444-4444-4444-4444-444444444403', 'Boa tarde! Preciso reagendar minha reunião.',                       'CLIENTE',    '33333333-3333-3333-3333-333333333302', DATEADD('MINUTE', -40, NOW())),
  ('44444444-4444-4444-4444-444444444404', 'Boa tarde, Julia! Consigo encaixar na quinta às 10h. Funciona?',    'ATENDENTE',  '33333333-3333-3333-3333-333333333302', DATEADD('MINUTE', -30, NOW())),
  ('44444444-4444-4444-4444-444444444405', 'Perfeito, muito obrigada pelo retorno!',                            'CLIENTE',    '33333333-3333-3333-3333-333333333302', DATEADD('MINUTE', -26, NOW()));

-- Mensagens da conversa 3 (Marcelo Andrade)
INSERT INTO mensagens (id, texto, autor, conversa_id, criado_em) VALUES
  ('44444444-4444-4444-4444-444444444406', 'Enviei os documentos por e-mail, pode conferir?',                   'CLIENTE',    '33333333-3333-3333-3333-333333333303', DATEADD('HOUR', -3, NOW()));

-- Mensagens da conversa 4 (Aline Souza)
INSERT INTO mensagens (id, texto, autor, conversa_id, criado_em) VALUES
  ('44444444-4444-4444-4444-444444444407', 'Quero falar com um atendente sobre a minha fatura.',                'CLIENTE',    '33333333-3333-3333-3333-333333333304', DATEADD('HOUR', -27, NOW())),
  ('44444444-4444-4444-4444-444444444408', 'Claro! Já estou verificando aqui, Aline.',                          'ATENDENTE',  '33333333-3333-3333-3333-333333333304', DATEADD('HOUR', -26, NOW())),
  ('44444444-4444-4444-4444-444444444409', 'Obrigada! Fico no aguardo.',                                        'CLIENTE',    '33333333-3333-3333-3333-333333333304', DATEADD('HOUR', -26, NOW()));

-- Usuario admin padrao
INSERT INTO usuarios (id, nome, email, senha, perfil, criado_em) VALUES
  ('55555555-5555-5555-5555-555555555501', 'Usuário Adm', 'user.adm@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NOW());
