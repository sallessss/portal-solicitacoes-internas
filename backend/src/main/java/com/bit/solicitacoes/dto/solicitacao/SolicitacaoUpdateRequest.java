package com.bit.solicitacoes.dto.solicitacao;

import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SolicitacaoUpdateRequest(
        @NotBlank(message = "O título é obrigatório")
        @Size(min = 3, max = 120, message = "O título deve ter entre 3 e 120 caracteres")
        String titulo,

        @NotBlank(message = "A descrição é obrigatória")
        @Size(min = 10, max = 500, message = "A descrição deve ter entre 10 e 500 caracteres")
        String descricao,

        @NotNull(message = "A categoria é obrigatória")
        CategoriaSolicitacao categoria
) {
}
