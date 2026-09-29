package com.bit.solicitacoes.dto.auth;

public record LoginResponse(String token, String type, long expiresIn, UsuarioResponse user) {
}
