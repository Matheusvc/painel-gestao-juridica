package com.castroadvocacia.plataforma.dto;

import java.util.List;
import java.util.Map;

public record PlanilhaDataDTO(
    String categoria,
    List<Map<String, String>> colunas,
    List<Map<String, String>> linhas,
    int total,
    int pagina,
    int tamanhoPagina
) {}
