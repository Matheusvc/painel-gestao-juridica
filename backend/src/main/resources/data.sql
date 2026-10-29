-- Usuario admin padrao (senha: castro2025)
-- TROQUE a senha após o primeiro login!
INSERT INTO usuarios (id, nome, email, senha, perfil, criado_em)
VALUES ('55555555-5555-5555-5555-555555555501', 'Usuário Adm', 'admin@castroadvocacia.com', '$2a$10$wWeEuVw7LHdJsVYrSCdVBeEu8l5XN2Mq8NXxHqMOtR82KOdcrzGQG', 'ADMIN', NOW())
ON CONFLICT (id) DO NOTHING;
