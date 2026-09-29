package com.bit.solicitacoes.dto.solicitacao;

import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitacaoResumoResponse(
        UUID id,
        String codigo,
        String titulo,
        CategoriaSolicitacao categoria,
        StatusSolicitacao status,
        String solicitante,
        LocalDateTime createdAt
) {
}
