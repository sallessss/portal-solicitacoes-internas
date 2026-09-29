package com.bit.solicitacoes.service;

import com.bit.solicitacoes.dto.solicitacao.AlterarStatusRequest;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoCreateRequest;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoUpdateRequest;
import com.bit.solicitacoes.entity.Solicitacao;
import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.Role;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import com.bit.solicitacoes.exception.BusinessException;
import com.bit.solicitacoes.exception.ForbiddenOperationException;
import com.bit.solicitacoes.exception.ResourceNotFoundException;
import com.bit.solicitacoes.repository.SolicitacaoRepository;
import com.bit.solicitacoes.repository.UsuarioRepository;
import com.bit.solicitacoes.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SolicitacaoServiceTest {
    @Mock
    private SolicitacaoRepository solicitacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private SolicitacaoService service;

    private Usuario usuario;
    private Usuario outroUsuario;
    private Usuario admin;
    private AuthenticatedUser userPrincipal;
    private AuthenticatedUser outroUserPrincipal;
    private AuthenticatedUser adminPrincipal;

    @BeforeEach
    void setUp() {
        usuario = usuario("usuario", Role.USER);
        outroUsuario = usuario("outro", Role.USER);
        admin = usuario("admin", Role.ADMIN);
        userPrincipal = new AuthenticatedUser(usuario);
        outroUserPrincipal = new AuthenticatedUser(outroUsuario);
        adminPrincipal = new AuthenticatedUser(admin);
    }

    @Test
    void deveCriarSolicitacaoAbertaComCodigoGerado() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(solicitacaoRepository.findMaiorNumeroCodigo()).thenReturn(7);
        when(solicitacaoRepository.save(any(Solicitacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.criar(
                new SolicitacaoCreateRequest(" Notebook ", " Notebook nao liga mais ", CategoriaSolicitacao.TI),
                userPrincipal
        );

        assertThat(response.codigo()).isEqualTo("SOL-000008");
        assertThat(response.status()).isEqualTo(StatusSolicitacao.ABERTO);
        assertThat(response.usuarioId()).isEqualTo(usuario.getId());
        assertThat(response.titulo()).isEqualTo("Notebook");
        assertThat(response.descricao()).isEqualTo("Notebook nao liga mais");
    }

    @Test
    void deveFalharAoCriarQuandoUsuarioAutenticadoNaoExiste() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(
                new SolicitacaoCreateRequest("Notebook", "Notebook nao liga mais", CategoriaSolicitacao.TI),
                userPrincipal
        )).isInstanceOf(ResourceNotFoundException.class);

        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    void deveListarApenasSolicitacoesDoUsuarioComum() {
        var pageable = PageRequest.of(0, 10);
        var solicitacao = solicitacao(StatusSolicitacao.ABERTO, usuario);
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(solicitacaoRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(solicitacao), pageable, 1));

        var page = service.listar(
                StatusSolicitacao.ABERTO,
                CategoriaSolicitacao.TI,
                null,
                null,
                "Titulo",
                pageable,
                userPrincipal
        );

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().getFirst().codigo()).isEqualTo("SOL-000001");
        verify(usuarioRepository).findById(usuario.getId());
    }

    @Test
    void deveListarTodasSolicitacoesParaAdminSemBuscarUsuario() {
        var pageable = PageRequest.of(0, 10);
        when(solicitacaoRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(solicitacao(StatusSolicitacao.ABERTO, usuario)), pageable, 1));

        var page = service.listar(null, null, null, null, null, pageable, adminPrincipal);

        assertThat(page.getTotalElements()).isEqualTo(1);
        verify(usuarioRepository, never()).findById(any());
    }

    @Test
    void deveBloquearFiltroComPeriodoInvalido() {
        assertThatThrownBy(() -> service.listar(
                null,
                null,
                LocalDate.of(2026, 9, 30),
                LocalDate.of(2026, 9, 29),
                null,
                PageRequest.of(0, 10),
                userPrincipal
        )).isInstanceOf(BusinessException.class);
    }

    @Test
    void deveDetalharSolicitacaoDoProprioUsuario() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.ABERTO, usuario)));

        var response = service.detalhar(id, userPrincipal);

        assertThat(response.solicitante()).isEqualTo("usuario");
    }

    @Test
    void devePermitirAdminDetalharSolicitacaoDeOutroUsuario() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.ABERTO, usuario)));

        var response = service.detalhar(id, adminPrincipal);

        assertThat(response.codigo()).isEqualTo("SOL-000001");
    }

    @Test
    void deveBloquearVisualizacaoDeSolicitacaoDeOutroUsuario() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.ABERTO, usuario)));

        assertThatThrownBy(() -> service.detalhar(id, outroUserPrincipal))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void deveRetornarNotFoundAoDetalharSolicitacaoInexistenteOuExcluida() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.detalhar(id, userPrincipal))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveEditarSolicitacaoAbertaDoProprietario() {
        UUID id = UUID.randomUUID();
        var solicitacao = solicitacao(StatusSolicitacao.ABERTO, usuario);
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoRepository.save(solicitacao)).thenReturn(solicitacao);

        var response = service.editar(
                id,
                new SolicitacaoUpdateRequest(" Novo titulo ", " Nova descricao valida ", CategoriaSolicitacao.RH),
                userPrincipal
        );

        assertThat(response.titulo()).isEqualTo("Novo titulo");
        assertThat(response.descricao()).isEqualTo("Nova descricao valida");
        assertThat(response.categoria()).isEqualTo(CategoriaSolicitacao.RH);
    }

    @Test
    void deveBloquearEdicaoQuandoStatusNaoAberto() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.EM_ATENDIMENTO, usuario)));

        assertThatThrownBy(() -> service.editar(
                id,
                new SolicitacaoUpdateRequest("Novo", "Descricao valida", CategoriaSolicitacao.RH),
                userPrincipal
        )).isInstanceOf(BusinessException.class);
    }

    @Test
    void deveBloquearEdicaoQuandoUsuarioNaoEProprietario() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.ABERTO, usuario)));

        assertThatThrownBy(() -> service.editar(
                id,
                new SolicitacaoUpdateRequest("Novo", "Descricao valida", CategoriaSolicitacao.RH),
                outroUserPrincipal
        )).isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void devePermitirAdminEditarSuaPropriaSolicitacaoAberta() {
        UUID id = UUID.randomUUID();
        var solicitacao = solicitacao(StatusSolicitacao.ABERTO, admin);
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoRepository.save(solicitacao)).thenReturn(solicitacao);

        var response = service.editar(
                id,
                new SolicitacaoUpdateRequest("Novo", "Descricao valida", CategoriaSolicitacao.RH),
                adminPrincipal
        );

        assertThat(response.solicitante()).isEqualTo("admin");
    }

    @Test
    void deveExecutarSoftDeleteQuandoSolicitacaoEstaAbertaEDoProprietario() {
        UUID id = UUID.randomUUID();
        var solicitacao = solicitacao(StatusSolicitacao.ABERTO, usuario);
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(solicitacao));

        service.excluir(id, userPrincipal);

        ArgumentCaptor<Solicitacao> captor = ArgumentCaptor.forClass(Solicitacao.class);
        verify(solicitacaoRepository).save(captor.capture());
        assertThat(captor.getValue().getDeletedAt()).isNotNull();
    }

    @Test
    void deveBloquearExclusaoQuandoStatusNaoAberto() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.CONCLUIDO, usuario)));

        assertThatThrownBy(() -> service.excluir(id, userPrincipal))
                .isInstanceOf(BusinessException.class);

        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    void deveBloquearExclusaoQuandoUsuarioNaoEProprietario() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.ABERTO, usuario)));

        assertThatThrownBy(() -> service.excluir(id, outroUserPrincipal))
                .isInstanceOf(ForbiddenOperationException.class);

        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    void deveAlterarStatusQuandoAdminSegueFluxoPermitido() {
        UUID id = UUID.randomUUID();
        var solicitacao = solicitacao(StatusSolicitacao.ABERTO, usuario);
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoRepository.save(solicitacao)).thenReturn(solicitacao);

        var response = service.alterarStatus(
                id,
                new AlterarStatusRequest(StatusSolicitacao.EM_ATENDIMENTO),
                adminPrincipal
        );

        assertThat(response.status()).isEqualTo(StatusSolicitacao.EM_ATENDIMENTO);
    }

    @Test
    void devePermitirManterMesmoStatus() {
        UUID id = UUID.randomUUID();
        var solicitacao = solicitacao(StatusSolicitacao.ABERTO, usuario);
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoRepository.save(solicitacao)).thenReturn(solicitacao);

        var response = service.alterarStatus(
                id,
                new AlterarStatusRequest(StatusSolicitacao.ABERTO),
                adminPrincipal
        );

        assertThat(response.status()).isEqualTo(StatusSolicitacao.ABERTO);
    }

    @Test
    void deveBloquearUserAlterandoStatus() {
        assertThatThrownBy(() -> service.alterarStatus(
                UUID.randomUUID(),
                new AlterarStatusRequest(StatusSolicitacao.EM_ATENDIMENTO),
                userPrincipal
        )).isInstanceOf(ForbiddenOperationException.class);

        verify(solicitacaoRepository, never()).findByIdAndDeletedAtIsNull(any());
    }

    @Test
    void deveBloquearRetrocessoDeStatus() {
        UUID id = UUID.randomUUID();
        when(solicitacaoRepository.findByIdAndDeletedAtIsNull(id))
                .thenReturn(Optional.of(solicitacao(StatusSolicitacao.CONCLUIDO, usuario)));

        assertThatThrownBy(() -> service.alterarStatus(
                id,
                new AlterarStatusRequest(StatusSolicitacao.ABERTO),
                adminPrincipal
        )).isInstanceOf(BusinessException.class);
    }

    private Usuario usuario(String username, Role role) {
        return Usuario.builder()
                .id(UUID.randomUUID())
                .username(username)
                .password("hash")
                .role(role)
                .build();
    }

    private Solicitacao solicitacao(StatusSolicitacao status, Usuario usuario) {
        return Solicitacao.builder()
                .id(UUID.randomUUID())
                .codigo("SOL-000001")
                .titulo("Titulo")
                .descricao("Descricao")
                .categoria(CategoriaSolicitacao.TI)
                .status(status)
                .usuario(usuario)
                .build();
    }
}
