package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.Processo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProcessoRepository extends JpaRepository<Processo, UUID> {

    // Todas as queries incluem dados legados (usuarioId NULL), visíveis a todos os usuários.

    @Query("SELECT p FROM Processo p WHERE p.usuarioId = :uid OR p.usuarioId IS NULL")
    List<Processo> findByUsuarioIdOrLegacy(@Param("uid") UUID usuarioId);

    @Query("SELECT p FROM Processo p WHERE p.categoria = :cat AND (p.usuarioId = :uid OR p.usuarioId IS NULL)")
    List<Processo> findByCategoriaAndUsuarioIdOrLegacy(@Param("cat") String categoria, @Param("uid") UUID usuarioId);

    @Modifying
    @Query("DELETE FROM Processo p WHERE p.categoria = :cat AND (p.usuarioId = :uid OR p.usuarioId IS NULL)")
    void deleteByCategoriaAndUsuarioId(@Param("cat") String categoria, @Param("uid") UUID usuarioId);

    @Query("SELECT DISTINCT p.categoria FROM Processo p WHERE p.usuarioId = :uid OR p.usuarioId IS NULL ORDER BY p.categoria")
    List<String> findDistinctCategoriasByUsuarioId(@Param("uid") UUID usuarioId);

    @Query("SELECT p.corretor, COUNT(DISTINCT p.cliente) FROM Processo p WHERE p.corretor IS NOT NULL AND p.corretor <> '' AND (p.usuarioId = :uid OR p.usuarioId IS NULL) GROUP BY p.corretor ORDER BY COUNT(DISTINCT p.cliente) DESC")
    List<Object[]> countClientesPorCorretorByUsuarioId(@Param("uid") UUID usuarioId);

    @Query("SELECT DISTINCT p.corretor FROM Processo p WHERE p.corretor IS NOT NULL AND p.corretor <> '' AND (p.usuarioId = :uid OR p.usuarioId IS NULL) ORDER BY p.corretor")
    List<String> findDistinctCorretoresByUsuarioId(@Param("uid") UUID usuarioId);

    @Query("SELECT p FROM Processo p WHERE LOWER(p.corretor) = LOWER(:corretor) AND (p.usuarioId = :uid OR p.usuarioId IS NULL)")
    List<Processo> findByCorretorIgnoreCaseAndUsuarioId(@Param("corretor") String corretor, @Param("uid") UUID usuarioId);
}
