package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {
    java.util.List<Servico> findByCategoria(String categoria);
    void deleteByCategoria(String categoria);

    @Query("SELECT MAX(s.numero) FROM Servico s")
    Optional<Integer> findMaxNumero();
}
