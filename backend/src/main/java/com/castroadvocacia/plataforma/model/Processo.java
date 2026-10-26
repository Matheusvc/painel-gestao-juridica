package com.castroadvocacia.plataforma.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "processos")
@Getter
@Setter
@NoArgsConstructor
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String categoria;

    private String corretor;
    private String cliente;
    private String cpf;
    private String status;

    // --- Campos administrativos ---
    private String ano;
    private String mes;
    private String beneficio;
    private String tipo;
    private String fisico;
    private String protocolado;
    private String dataProtocolo;
    private String protocolo;
    private String concessao;
    private String aba;

    @Column(length = 2000)
    private String tarefas;

    @Column(length = 2000)
    private String observacao;

    // --- Campos judiciais ---
    private String numeroProcesso;
    private String esp;
    private String vara;
    private String valor;
    private String dataMovimentacao;
    private String dataImplantacaoBeneficio;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    private LocalDateTime atualizadoEm = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }
}
