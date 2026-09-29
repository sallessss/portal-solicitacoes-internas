package com.bit.solicitacoes.controller;

import com.bit.solicitacoes.dto.auth.LoginRequest;
import com.bit.solicitacoes.dto.auth.LoginResponse;
import com.bit.solicitacoes.dto.auth.UsuarioResponse;
import com.bit.solicitacoes.security.AuthenticatedUser;
import com.bit.solicitacoes.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Autentica usuário e retorna JWT")
    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Retorna usuário autenticado")
    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal AuthenticatedUser user) {
        return authService.me(user);
    }
}
