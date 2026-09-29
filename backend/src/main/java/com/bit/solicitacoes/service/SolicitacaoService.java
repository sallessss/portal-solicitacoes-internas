package com.bit.solicitacoes.service;

import com.bit.solicitacoes.dto.solicitacao.AlterarStatusRequest;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoCreateRequest;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoResponse;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoResumoResponse;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoUpdateRequest;
import com.bit.solicitacoes.entity.Solicitacao;
import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import com.bit.solicitacoes.exception.BusinessException;
import com.bit.solicitacoes.exception.ForbiddenOperationException;
import com.bit.solicitacoes.exception.ResourceNotFoundException;
import com.bit.solicitacoes.repository.SolicitacaoRepository;
import com.bit.solicitacoes.repository.SolicitacaoSpecifications;
import com.bit.solicitacoes.repository.UsuarioRepository;
import com.bit.solicitacoes.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {
    private final SolicitacaoRepository solicitacaoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public SolicitacaoResponse criar(SolicitacaoCreateRequest request, AuthenticatedUser authenticatedUser) {
        Usuario usuario = buscarUsuario(authenticatedUser);
        Solicitacao solicitacao = Solicitacao.builder()
                .id(UUID.randomUUID())
                .codigo(gerarCodigo())
                .titulo(request.titulo().trim())
                .descricao(request.descricao().trim())
                .categoria(request.categoria())
                .status(StatusSolicitacao.ABERTO)
                .usuario(usuario)
                .build();
        return toResponse(solicitacaoRepository.save(solicitacao));
    }

    @Transactional(readOnly = true)
    public Page<SolicitacaoResumoResponse> listar(
            StatusSolicitacao status,
            CategoriaSolicitacao categoria,
            LocalDate dataInicio,
            LocalDate dataFim,
            String titulo,
            Pageable pageable,
            AuthenticatedUser user
    ) {
        validarPeriodo(dataInicio, dataFim);
        Specification<Solicitacao> specification = Specification.where(SolicitacaoSpecifications.ativas())
                .and(SolicitacaoSpecifications.status(status))
                .and(SolicitacaoSpecifications.categoria(categoria))
                .and(SolicitacaoSpecifications.criadaEntre(dataInicio, dataFim))
                .and(SolicitacaoSpecifications.tituloContem(titulo));

        if (!user.isAdmin()) {
            specification = specification.and(SolicitacaoSpecifications.doUsuario(buscarUsuario(user)));
        }

        return solicitacaoRepository.findAll(specification, pageable).map(this::toResumo);
    }

    @Transactional(readOnly = true)
    public SolicitacaoResponse detalhar(UUID id, AuthenticatedUser user) {
        Solicitacao solicitacao = buscarAtiva(id);
        validarVisualizacao(solicitacao, user);
        return toResponse(solicitacao);
    }

    @Transactional
    public SolicitacaoResponse editar(UUID id, SolicitacaoUpdateRequest request, AuthenticatedUser user) {
        Solicitacao solicitacao = buscarAtiva(id);
        validarProprietario(solicitacao, user);
        validarAberta(solicitacao, "Somente solicitações abertas podem ser editadas");

        solicitacao.setTitulo(request.titulo().trim());
        solicitacao.setDescricao(request.descricao().trim());
        solicitacao.setCategoria(request.categoria());
        return toResponse(solicitacaoRepository.save(solicitacao));
    }

    @Transactional
    public void excluir(UUID id, AuthenticatedUser user) {
        Solicitacao solicitacao = buscarAtiva(id);
        validarProprietario(solicitacao, user);
        validarAberta(solicitacao, "Somente solicitações abertas podem ser excluídas");
        solicitacao.setDeletedAt(LocalDateTime.now());
        solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public SolicitacaoResponse alterarStatus(UUID id, AlterarStatusRequest request, AuthenticatedUser user) {
        if (!user.isAdmin()) {
            throw new ForbiddenOperationException("Somente administradores podem alterar status");
        }
        Solicitacao solicitacao = buscarAtiva(id);
        validarTransicao(solicitacao.getStatus(), request.status());
        solicitacao.setStatus(request.status());
        return toResponse(solicitacaoRepository.save(solicitacao));
    }

    private Usuario buscarUsuario(AuthenticatedUser user) {
        return usuarioRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não encontrado"));
    }

    private Solicitacao buscarAtiva(UUID id) {
        return solicitacaoRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));
    }

    private synchronized String gerarCodigo() {
        int proximo = solicitacaoRepository.findMaiorNumeroCodigo() + 1;
        return "SOL-%06d".formatted(proximo);
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new BusinessException("A data inicial não pode ser maior que a data final");
        }
    }

    private void validarVisualizacao(Solicitacao solicitacao, AuthenticatedUser user) {
        if (!user.isAdmin() && !solicitacao.getUsuario().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Você não pode visualizar esta solicitação");
        }
    }

    private void validarProprietario(Solicitacao solicitacao, AuthenticatedUser user) {
        if (!solicitacao.getUsuario().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Você não tem permissão para alterar esta solicitação");
        }
    }

    private void validarAberta(Solicitacao solicitacao, String message) {
        if (solicitacao.getStatus() != StatusSolicitacao.ABERTO) {
            throw new BusinessException(message);
        }
    }

    private void validarTransicao(StatusSolicitacao atual, StatusSolicitacao novo) {
        if (atual == novo) {
            return;
        }
        boolean valida = (atual == StatusSolicitacao.ABERTO && novo == StatusSolicitacao.EM_ATENDIMENTO)
                || (atual == StatusSolicitacao.EM_ATENDIMENTO && novo == StatusSolicitacao.CONCLUIDO);
        if (!valida) {
            throw new BusinessException("Transição de status inválida");
        }
    }

    private SolicitacaoResponse toResponse(Solicitacao solicitacao) {
        return new SolicitacaoResponse(
                solicitacao.getId(),
                solicitacao.getCodigo(),
                solicitacao.getTitulo(),
                solicitacao.getDescricao(),
                solicitacao.getCategoria(),
                solicitacao.getStatus(),
                solicitacao.getUsuario().getId(),
                solicitacao.getUsuario().getUsername(),
                solicitacao.getCreatedAt(),
                solicitacao.getUpdatedAt()
        );
    }

    private SolicitacaoResumoResponse toResumo(Solicitacao solicitacao) {
        return new SolicitacaoResumoResponse(
                solicitacao.getId(),
                solicitacao.getCodigo(),
                solicitacao.getTitulo(),
                solicitacao.getCategoria(),
                solicitacao.getStatus(),
                solicitacao.getUsuario().getUsername(),
                solicitacao.getCreatedAt()
        );
    }
}
