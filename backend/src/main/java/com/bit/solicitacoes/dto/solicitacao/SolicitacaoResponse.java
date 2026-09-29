package com.bit.solicitacoes.dto.solicitacao;

import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitacaoResponse(
        UUID id,
        String codigo,
        String titulo,
        String descricao,
        CategoriaSolicitacao categoria,
        StatusSolicitacao status,
        UUID usuarioId,
        String solicitante,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
