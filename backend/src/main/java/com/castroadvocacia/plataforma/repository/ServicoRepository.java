package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {
    java.util.List<Servico> findByCategoria(String categoria);
    void deleteByCategoria(String categoria);
}
