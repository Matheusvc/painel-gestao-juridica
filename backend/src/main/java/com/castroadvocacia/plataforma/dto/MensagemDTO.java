package com.castroadvocacia.plataforma.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MensagemDTO(
    String id,
    String author,
    String text,
    long createdAt,
    String status
) {}
