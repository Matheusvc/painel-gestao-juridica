package com.castroadvocacia.plataforma.dto;

import jakarta.validation.constraints.NotBlank;

public record MensagemRequest(
    @NotBlank String text
) {}
