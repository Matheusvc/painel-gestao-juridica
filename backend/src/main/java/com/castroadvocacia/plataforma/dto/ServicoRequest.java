package com.castroadvocacia.plataforma.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServicoRequest(
    @NotBlank String title,
    String service,
    @NotBlank String total,
    @NotBlank String ownerName,
    @NotNull String status
) {}
