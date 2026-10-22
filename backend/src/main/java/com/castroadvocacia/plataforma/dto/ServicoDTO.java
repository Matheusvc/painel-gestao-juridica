package com.castroadvocacia.plataforma.dto;

public record ServicoDTO(
    String id,
    String updatedAt,
    String title,
    String service,
    String total,
    ResponsavelDTO owner,
    String status
) {}
