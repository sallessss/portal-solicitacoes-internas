package com.bit.solicitacoes.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class DemoPasswordHashTest {
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void deveValidarHashDoAdminDemo() {
        assertThat(encoder.matches("admin123", "$2a$10$/FNmXY53Rmwmx8vzE1iRE.buC4/Nt4JOh4kUmSQfup2AkgRzCNmC6")).isTrue();
    }

    @Test
    void deveValidarHashDoUsuarioDemo() {
        assertThat(encoder.matches("usuario123", "$2a$10$I.48Lx.yuFznGultW7loEuVjqaJF2OIlQiBJqcJ5VW.6IeUJdyzW2")).isTrue();
    }
}
