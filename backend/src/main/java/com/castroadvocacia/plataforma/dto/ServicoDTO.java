package com.castroadvocacia.plataforma.dto;

public record ServicoDTO(
    String id,
    String updatedAt,
    String title,
    String service,
    String total,
    CorretorDTO owner,
    String status,
    String categoria
) {}
