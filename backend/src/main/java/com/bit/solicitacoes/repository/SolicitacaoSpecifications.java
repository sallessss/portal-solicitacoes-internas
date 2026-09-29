package com.bit.solicitacoes.repository;

import com.bit.solicitacoes.entity.Solicitacao;
import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;

public final class SolicitacaoSpecifications {
    private SolicitacaoSpecifications() {
    }

    public static Specification<Solicitacao> ativas() {
        return (root, query, builder) -> builder.isNull(root.get("deletedAt"));
    }

    public static Specification<Solicitacao> doUsuario(Usuario usuario) {
        return (root, query, builder) -> builder.equal(root.get("usuario"), usuario);
    }

    public static Specification<Solicitacao> status(StatusSolicitacao status) {
        return (root, query, builder) -> status == null ? builder.conjunction() : builder.equal(root.get("status"), status);
    }

    public static Specification<Solicitacao> categoria(CategoriaSolicitacao categoria) {
        return (root, query, builder) -> categoria == null ? builder.conjunction() : builder.equal(root.get("categoria"), categoria);
    }

    public static Specification<Solicitacao> tituloContem(String titulo) {
        return (root, query, builder) -> {
            if (titulo == null || titulo.isBlank()) {
                return builder.conjunction();
            }
            return builder.like(builder.lower(root.get("titulo")), "%" + titulo.toLowerCase().trim() + "%");
        };
    }

    public static Specification<Solicitacao> criadaEntre(LocalDate inicio, LocalDate fim) {
        return (root, query, builder) -> {
            if (inicio == null && fim == null) {
                return builder.conjunction();
            }
            if (inicio != null && fim != null) {
                return builder.between(root.get("createdAt"), inicio.atStartOfDay(), fim.atTime(LocalTime.MAX));
            }
            if (inicio != null) {
                return builder.greaterThanOrEqualTo(root.get("createdAt"), inicio.atStartOfDay());
            }
            return builder.lessThanOrEqualTo(root.get("createdAt"), fim.atTime(LocalTime.MAX));
        };
    }
}
