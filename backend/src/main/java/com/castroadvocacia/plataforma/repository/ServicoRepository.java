package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {
    List<Servico> findByCategoria(String categoria);
    void deleteByCategoria(String categoria);

    @Query("SELECT MAX(s.numero) FROM Servico s")
    Optional<Integer> findMaxNumero();

    // --- Queries filtradas por usuário (inclui dados legados com usuarioId NULL) ---

    @Query("SELECT s FROM Servico s WHERE s.usuarioId = :uid OR s.usuarioId IS NULL")
    List<Servico> findByUsuarioIdOrLegacy(@Param("uid") UUID usuarioId);

    @Query("SELECT s FROM Servico s WHERE s.categoria = :cat AND (s.usuarioId = :uid OR s.usuarioId IS NULL)")
    List<Servico> findByCategoriaAndUsuarioIdOrLegacy(@Param("cat") String categoria, @Param("uid") UUID usuarioId);

    @Modifying
    @Query("DELETE FROM Servico s WHERE s.categoria = :cat AND (s.usuarioId = :uid OR s.usuarioId IS NULL)")
    void deleteByCategoriaAndUsuarioId(@Param("cat") String categoria, @Param("uid") UUID usuarioId);
}
