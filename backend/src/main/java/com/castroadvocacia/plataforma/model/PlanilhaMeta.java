package com.castroadvocacia.plataforma.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "planilha_meta")
@Getter
@Setter
@NoArgsConstructor
public class PlanilhaMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String categoria;

    private UUID usuarioId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String colunas;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
