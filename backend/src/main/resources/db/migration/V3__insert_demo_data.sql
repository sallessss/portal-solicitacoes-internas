insert into usuarios (id, username, password, role, created_at) values
('11111111-1111-1111-1111-111111111111', 'admin', '$2a$10$/FNmXY53Rmwmx8vzE1iRE.buC4/Nt4JOh4kUmSQfup2AkgRzCNmC6', 'ADMIN', current_timestamp),
('22222222-2222-2222-2222-222222222222', 'usuario', '$2a$10$I.48Lx.yuFznGultW7loEuVjqaJF2OIlQiBJqcJ5VW.6IeUJdyzW2', 'USER', current_timestamp);

insert into solicitacoes (id, codigo, titulo, descricao, categoria, status, usuario_id, created_at, updated_at) values
('33333333-3333-3333-3333-333333333331', 'SOL-000001', 'Problema no computador', 'Computador nao esta inicializando ao chegar no setor.', 'TI', 'ABERTO', '22222222-2222-2222-2222-222222222222', current_timestamp - interval '5 days', current_timestamp - interval '5 days'),
('33333333-3333-3333-3333-333333333332', 'SOL-000002', 'Atualizacao de cadastro', 'Solicito atualizacao dos dados cadastrais no RH.', 'RH', 'EM_ATENDIMENTO', '22222222-2222-2222-2222-222222222222', current_timestamp - interval '4 days', current_timestamp - interval '3 days'),
('33333333-3333-3333-3333-333333333333', 'SOL-000003', 'Compra de mouse', 'Mouse atual apresenta falhas frequentes no clique.', 'COMPRAS', 'CONCLUIDO', '22222222-2222-2222-2222-222222222222', current_timestamp - interval '3 days', current_timestamp - interval '1 day'),
('33333333-3333-3333-3333-333333333334', 'SOL-000004', 'Ajuste no ar-condicionado', 'Sala esta com oscilacao forte de temperatura durante o expediente.', 'INFRAESTRUTURA', 'ABERTO', '11111111-1111-1111-1111-111111111111', current_timestamp - interval '2 days', current_timestamp - interval '2 days'),
('33333333-3333-3333-3333-333333333335', 'SOL-000005', 'Reembolso de viagem', 'Solicito acompanhamento do reembolso de deslocamento corporativo.', 'FINANCEIRO', 'EM_ATENDIMENTO', '11111111-1111-1111-1111-111111111111', current_timestamp - interval '1 day', current_timestamp - interval '1 day');
