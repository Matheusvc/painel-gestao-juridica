package com.castroadvocacia.plataforma.dto;

public record ContatoDTO(
    String name,
    String initials,
    String role,
    boolean online
) {}
