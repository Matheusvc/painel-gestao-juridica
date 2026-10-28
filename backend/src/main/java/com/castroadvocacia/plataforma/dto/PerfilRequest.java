package com.castroadvocacia.plataforma.dto;

public record PerfilRequest(
    String nome,
    String sobrenome,
    String cargo,
    String fotoUrl
) {}
