package com.bit.solicitacoes.service;

import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.Role;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import com.bit.solicitacoes.repository.SolicitacaoRepository;
import com.bit.solicitacoes.repository.UsuarioRepository;
import com.bit.solicitacoes.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {
    @Mock
    private SolicitacaoRepository solicitacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private DashboardService service;

    private Usuario usuario;
    private Usuario admin;
    private AuthenticatedUser userPrincipal;
    private AuthenticatedUser adminPrincipal;

    @BeforeEach
    void setUp() {
        usuario = usuario("usuario", Role.USER);
        admin = usuario("admin", Role.ADMIN);
        userPrincipal = new AuthenticatedUser(usuario);
        adminPrincipal = new AuthenticatedUser(admin);
    }

    @Test
    void deveObterIndicadoresGlobaisParaAdmin() {
        when(solicitacaoRepository.countByDeletedAtIsNull()).thenReturn(10L);
        when(solicitacaoRepository.countByDeletedAtIsNullAndStatus(StatusSolicitacao.ABERTO)).thenReturn(4L);
        when(solicitacaoRepository.countByDeletedAtIsNullAndStatus(StatusSolicitacao.EM_ATENDIMENTO)).thenReturn(3L);
        when(solicitacaoRepository.countByDeletedAtIsNullAndStatus(StatusSolicitacao.CONCLUIDO)).thenReturn(3L);

        var response = service.obterIndicadores(adminPrincipal);

        assertThat(response.total()).isEqualTo(10);
        assertThat(response.abertas()).isEqualTo(4);
        assertThat(response.emAtendimento()).isEqualTo(3);
        assertThat(response.concluidas()).isEqualTo(3);
        verify(usuarioRepository, never()).getReferenceById(admin.getId());
    }

    @Test
    void deveObterIndicadoresDoProprioUsuario() {
        when(usuarioRepository.getReferenceById(usuario.getId())).thenReturn(usuario);
        when(solicitacaoRepository.countByUsuarioAndDeletedAtIsNull(usuario)).thenReturn(5L);
        when(solicitacaoRepository.countByUsuarioAndDeletedAtIsNullAndStatus(usuario, StatusSolicitacao.ABERTO)).thenReturn(2L);
        when(solicitacaoRepository.countByUsuarioAndDeletedAtIsNullAndStatus(usuario, StatusSolicitacao.EM_ATENDIMENTO)).thenReturn(1L);
        when(solicitacaoRepository.countByUsuarioAndDeletedAtIsNullAndStatus(usuario, StatusSolicitacao.CONCLUIDO)).thenReturn(2L);

        var response = service.obterIndicadores(userPrincipal);

        assertThat(response.total()).isEqualTo(5);
        assertThat(response.abertas()).isEqualTo(2);
        assertThat(response.emAtendimento()).isEqualTo(1);
        assertThat(response.concluidas()).isEqualTo(2);
    }

    private Usuario usuario(String username, Role role) {
        return Usuario.builder()
                .id(UUID.randomUUID())
                .username(username)
                .password("hash")
                .role(role)
                .build();
    }
}
