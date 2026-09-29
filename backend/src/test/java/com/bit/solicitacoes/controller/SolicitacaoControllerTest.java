package com.bit.solicitacoes.controller;

import com.bit.solicitacoes.dto.solicitacao.SolicitacaoResponse;
import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.Role;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import com.bit.solicitacoes.exception.ForbiddenOperationException;
import com.bit.solicitacoes.exception.GlobalExceptionHandler;
import com.bit.solicitacoes.exception.ResourceNotFoundException;
import com.bit.solicitacoes.security.AuthenticatedUser;
import com.bit.solicitacoes.service.SolicitacaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SolicitacaoControllerTest {
    private SolicitacaoService solicitacaoService;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private AuthenticatedUser principal;

    @BeforeEach
    void setUp() {
        solicitacaoService = mock(SolicitacaoService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new SolicitacaoController(solicitacaoService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(
                        new AuthenticationPrincipalArgumentResolver(),
                        new PageableHandlerMethodArgumentResolver()
                )
                .build();
        objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        principal = new AuthenticatedUser(com.bit.solicitacoes.entity.Usuario.builder()
                .id(UUID.randomUUID())
                .username("usuario")
                .password("hash")
                .role(Role.USER)
                .build());
    }

    @Test
    void deveCriarSolicitacaoComStatus201() throws Exception {
        var response = response(UUID.randomUUID(), StatusSolicitacao.ABERTO);
        when(solicitacaoService.criar(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/solicitacoes")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "titulo", "Notebook",
                                "descricao", "Notebook nao liga mais",
                                "categoria", "TI"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").value("SOL-000001"))
                .andExpect(jsonPath("$.status").value("ABERTO"));
    }

    @Test
    void deveRetornar400QuandoPayloadDeCriacaoForInvalido() throws Exception {
        mockMvc.perform(post("/api/solicitacoes")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "titulo", "",
                                "descricao", "curta",
                                "categoria", "TI"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void deveRetornar404QuandoSolicitacaoNaoExistir() throws Exception {
        UUID id = UUID.randomUUID();
        when(solicitacaoService.detalhar(eq(id), any()))
                .thenThrow(new ResourceNotFoundException("Solicitação não encontrada"));

        mockMvc.perform(get("/api/solicitacoes/{id}", id).with(user(principal)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Solicitação não encontrada"));
    }

    @Test
    void deveRetornar403QuandoUsuarioNaoTiverPermissao() throws Exception {
        UUID id = UUID.randomUUID();
        when(solicitacaoService.detalhar(eq(id), any()))
                .thenThrow(new ForbiddenOperationException("Você não pode visualizar esta solicitação"));

        mockMvc.perform(get("/api/solicitacoes/{id}", id).with(user(principal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("não pode visualizar")));
    }

    @Test
    void deveEditarSolicitacaoComStatus200() throws Exception {
        UUID id = UUID.randomUUID();
        when(solicitacaoService.editar(eq(id), any(), any()))
                .thenReturn(response(id, StatusSolicitacao.ABERTO));

        mockMvc.perform(put("/api/solicitacoes/{id}", id)
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "titulo", "Novo titulo",
                                "descricao", "Descricao valida",
                                "categoria", "RH"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void deveExcluirSolicitacaoComStatus204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/solicitacoes/{id}", id).with(user(principal)))
                .andExpect(status().isNoContent());

        verify(solicitacaoService).excluir(eq(id), any());
    }

    private SolicitacaoResponse response(UUID id, StatusSolicitacao status) {
        return new SolicitacaoResponse(
                id,
                "SOL-000001",
                "Notebook",
                "Notebook nao liga mais",
                CategoriaSolicitacao.TI,
                status,
                principal.getId(),
                principal.getUsername(),
                LocalDateTime.of(2026, 9, 29, 15, 0),
                LocalDateTime.of(2026, 9, 29, 15, 0)
        );
    }
}
