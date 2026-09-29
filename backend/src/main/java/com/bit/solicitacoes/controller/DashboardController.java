package com.bit.solicitacoes.controller;

import com.bit.solicitacoes.dto.dashboard.DashboardResponse;
import com.bit.solicitacoes.security.AuthenticatedUser;
import com.bit.solicitacoes.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @Operation(summary = "Retorna indicadores do dashboard")
    @GetMapping
    public DashboardResponse obterIndicadores(@AuthenticationPrincipal AuthenticatedUser user) {
        return dashboardService.obterIndicadores(user);
    }
}
