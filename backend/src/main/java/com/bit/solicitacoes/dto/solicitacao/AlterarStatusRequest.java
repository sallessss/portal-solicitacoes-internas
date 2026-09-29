package com.bit.solicitacoes.dto.solicitacao;

import com.bit.solicitacoes.enums.StatusSolicitacao;
import jakarta.validation.constraints.NotNull;

public record AlterarStatusRequest(
        @NotNull(message = "O status é obrigatório")
        StatusSolicitacao status
) {
}
