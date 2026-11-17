package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.PlanilhaMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PlanilhaMetaRepository extends JpaRepository<PlanilhaMeta, UUID> {

    @Query("SELECT m FROM PlanilhaMeta m WHERE m.categoria = :cat AND (m.usuarioId = :uid OR m.usuarioId IS NULL) ORDER BY m.criadoEm DESC")
    Optional<PlanilhaMeta> findByCategoriaAndUsuarioIdOrLegacy(@Param("cat") String categoria, @Param("uid") UUID usuarioId);

    void deleteByCategoriaAndUsuarioId(String categoria, UUID usuarioId);
}
