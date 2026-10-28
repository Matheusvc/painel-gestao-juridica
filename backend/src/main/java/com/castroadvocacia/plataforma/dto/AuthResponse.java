package com.castroadvocacia.plataforma.dto;

public record AuthResponse(
        String token,
        String nome,
        String sobrenome,
        String email,
        String perfil,
        String cargo,
        String fotoUrl
) {}
