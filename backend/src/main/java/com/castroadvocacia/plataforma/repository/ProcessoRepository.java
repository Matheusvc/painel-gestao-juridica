package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.Processo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProcessoRepository extends JpaRepository<Processo, UUID> {

    List<Processo> findByCategoria(String categoria);

    void deleteByCategoria(String categoria);

    @Query("SELECT DISTINCT p.categoria FROM Processo p ORDER BY p.categoria")
    List<String> findDistinctCategorias();

    @Query("SELECT p.corretor, COUNT(DISTINCT p.cliente) FROM Processo p WHERE p.corretor IS NOT NULL AND p.corretor <> '' GROUP BY p.corretor ORDER BY COUNT(DISTINCT p.cliente) DESC")
    List<Object[]> countClientesPorCorretor();
}
