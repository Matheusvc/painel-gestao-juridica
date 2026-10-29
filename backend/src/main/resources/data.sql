-- Usuarios padrao
MERGE INTO usuarios (id, nome, email, senha, perfil, criado_em) KEY (id)
VALUES ('55555555-5555-5555-5555-555555555501', 'Usuário Adm', 'admin@castroadvocacia.com', '$2a$10$wWeEuVw7LHdJsVYrSCdVBeEu8l5XN2Mq8NXxHqMOtR82KOdcrzGQG', 'ADMIN', NOW());

MERGE INTO usuarios (id, nome, email, senha, perfil, criado_em) KEY (id)
VALUES ('55555555-5555-5555-5555-555555555502', 'Matheus Vitor', 'matheusvitorcl1@gmail.com', '$2a$10$qf/p9QqJQHh9SzHZj8aeReCTZ2z.Eh7YAGYOPImJaaBMsfehCaY..', 'ADMIN', NOW());
