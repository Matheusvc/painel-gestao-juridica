package com.castroadvocacia.plataforma.repository;

import com.castroadvocacia.plataforma.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {

    @Query("SELECT c FROM Cliente c WHERE c.usuarioId = :uid OR c.usuarioId IS NULL ORDER BY c.nome")
    List<Cliente> findByUsuarioIdOrLegacy(@Param("uid") UUID usuarioId);
}
