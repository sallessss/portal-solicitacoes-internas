package com.bit.solicitacoes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class SolicitacoesApplication {
    public static void main(String[] args) {
        String timeZone = System.getenv().getOrDefault("APP_TIME_ZONE", "America/Sao_Paulo");
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
        System.setProperty("user.timezone", timeZone);
        SpringApplication.run(SolicitacoesApplication.class, args);
    }
}
