package com.bit.solicitacoes.dto.auth;

import com.bit.solicitacoes.enums.Role;

import java.util.UUID;

public record UsuarioResponse(UUID id, String username, Role role) {
}
