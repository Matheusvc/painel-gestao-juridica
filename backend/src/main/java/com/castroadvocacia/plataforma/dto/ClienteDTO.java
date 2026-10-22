package com.castroadvocacia.plataforma.dto;

public record ClienteDTO(
    String id,
    String name,
    String initials,
    String cpf,
    String processNumber
) {}
