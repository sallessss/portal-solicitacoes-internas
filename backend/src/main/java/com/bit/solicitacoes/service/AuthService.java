package com.bit.solicitacoes.service;

import com.bit.solicitacoes.dto.auth.LoginRequest;
import com.bit.solicitacoes.dto.auth.LoginResponse;
import com.bit.solicitacoes.dto.auth.UsuarioResponse;
import com.bit.solicitacoes.security.AuthenticatedUser;
import com.bit.solicitacoes.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds(), toResponse(user));
    }

    public UsuarioResponse me(AuthenticatedUser user) {
        return toResponse(user);
    }

    private UsuarioResponse toResponse(AuthenticatedUser user) {
        return new UsuarioResponse(user.getId(), user.getUsername(), user.getRole());
    }
}
