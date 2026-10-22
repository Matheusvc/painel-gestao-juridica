package com.castroadvocacia.plataforma.dto;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(
    @NotBlank String name,
    String cpf,
    String processNumber
) {}
