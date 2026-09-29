create index idx_solicitacoes_usuario_id on solicitacoes(usuario_id);
create index idx_solicitacoes_status on solicitacoes(status);
create index idx_solicitacoes_categoria on solicitacoes(categoria);
create index idx_solicitacoes_created_at on solicitacoes(created_at);
create index idx_solicitacoes_ativas on solicitacoes(deleted_at) where deleted_at is null;
