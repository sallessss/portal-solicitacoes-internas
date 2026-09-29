create table usuarios (
    id uuid primary key,
    username varchar(80) not null unique,
    password varchar(255) not null,
    role varchar(20) not null,
    created_at timestamp not null default current_timestamp
);

create table solicitacoes (
    id uuid primary key,
    codigo varchar(20) not null unique,
    titulo varchar(120) not null,
    descricao text not null,
    categoria varchar(30) not null,
    status varchar(30) not null,
    usuario_id uuid not null references usuarios(id),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp null
);
