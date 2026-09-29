package com.bit.solicitacoes.service;

import com.bit.solicitacoes.dto.dashboard.DashboardResponse;
import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import com.bit.solicitacoes.repository.SolicitacaoRepository;
import com.bit.solicitacoes.repository.UsuarioRepository;
import com.bit.solicitacoes.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final SolicitacaoRepository solicitacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardResponse obterIndicadores(AuthenticatedUser user) {
        if (user.isAdmin()) {
            return new DashboardResponse(
                    solicitacaoRepository.countByDeletedAtIsNull(),
                    solicitacaoRepository.countByDeletedAtIsNullAndStatus(StatusSolicitacao.ABERTO),
                    solicitacaoRepository.countByDeletedAtIsNullAndStatus(StatusSolicitacao.EM_ATENDIMENTO),
                    solicitacaoRepository.countByDeletedAtIsNullAndStatus(StatusSolicitacao.CONCLUIDO)
            );
        }

        Usuario usuario = usuarioRepository.getReferenceById(user.getId());
        return new DashboardResponse(
                solicitacaoRepository.countByUsuarioAndDeletedAtIsNull(usuario),
                solicitacaoRepository.countByUsuarioAndDeletedAtIsNullAndStatus(usuario, StatusSolicitacao.ABERTO),
                solicitacaoRepository.countByUsuarioAndDeletedAtIsNullAndStatus(usuario, StatusSolicitacao.EM_ATENDIMENTO),
                solicitacaoRepository.countByUsuarioAndDeletedAtIsNullAndStatus(usuario, StatusSolicitacao.CONCLUIDO)
        );
    }
}
