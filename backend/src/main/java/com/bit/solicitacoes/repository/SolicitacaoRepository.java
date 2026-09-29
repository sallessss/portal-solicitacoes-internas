package com.bit.solicitacoes.repository;

import com.bit.solicitacoes.entity.Solicitacao;
import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.CategoriaSolicitacao;
import com.bit.solicitacoes.enums.StatusSolicitacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, UUID>, JpaSpecificationExecutor<Solicitacao> {
    Optional<Solicitacao> findByIdAndDeletedAtIsNull(UUID id);

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNullAndStatus(StatusSolicitacao status);

    long countByUsuarioAndDeletedAtIsNull(Usuario usuario);

    long countByUsuarioAndDeletedAtIsNullAndStatus(Usuario usuario, StatusSolicitacao status);

    @Query("select coalesce(max(cast(substring(s.codigo, 5) as integer)), 0) from Solicitacao s")
    int findMaiorNumeroCodigo();

    Page<Solicitacao> findByDeletedAtIsNullAndCategoria(CategoriaSolicitacao categoria, Pageable pageable);
}
