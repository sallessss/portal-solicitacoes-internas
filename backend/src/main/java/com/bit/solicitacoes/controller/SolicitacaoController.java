package com.bit.solicitacoes.controller;

import com.bit.solicitacoes.dto.solicitacao.AlterarStatusRequest;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoCreateRequest;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoResponse;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoResumoResponse;
import com.bit.solicitacoes.dto.solicitacao.SolicitacaoUpdateRequest;
import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import com.bit.solicitacoes.security.AuthenticatedUser;
import com.bit.solicitacoes.service.SolicitacaoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/solicitacoes")
@RequiredArgsConstructor
public class SolicitacaoController {
    private final SolicitacaoService solicitacaoService;

    @Operation(summary = "Lista solicitações com filtros e paginação")
    @GetMapping
    public Page<SolicitacaoResumoResponse> listar(
            StatusSolicitacao status,
            CategoriaSolicitacao categoria,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            String titulo,
            Pageable pageable,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return solicitacaoService.listar(status, categoria, dataInicio, dataFim, titulo, pageable, user);
    }

    @Operation(summary = "Detalha uma solicitação ativa")
    @GetMapping("/{id}")
    public SolicitacaoResponse detalhar(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        return solicitacaoService.detalhar(id, user);
    }

    @Operation(summary = "Cria solicitação")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoResponse criar(@RequestBody @Valid SolicitacaoCreateRequest request, @AuthenticationPrincipal AuthenticatedUser user) {
        return solicitacaoService.criar(request, user);
    }

    @Operation(summary = "Edita solicitação aberta do proprietário")
    @PutMapping("/{id}")
    public SolicitacaoResponse editar(
            @PathVariable UUID id,
            @RequestBody @Valid SolicitacaoUpdateRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return solicitacaoService.editar(id, request, user);
    }

    @Operation(summary = "Exclui solicitação com soft delete")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser user) {
        solicitacaoService.excluir(id, user);
    }

    @Operation(summary = "Altera status de uma solicitação")
    @PatchMapping("/{id}/status")
    public SolicitacaoResponse alterarStatus(
            @PathVariable UUID id,
            @RequestBody @Valid AlterarStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return solicitacaoService.alterarStatus(id, request, user);
    }
}
