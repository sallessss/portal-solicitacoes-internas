package com.bit.solicitacoes.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "O usuário é obrigatório") String username,
        @NotBlank(message = "A senha e obrigatoria") String password
) {
}
