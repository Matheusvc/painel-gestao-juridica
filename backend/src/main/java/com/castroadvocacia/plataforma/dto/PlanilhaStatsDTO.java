package com.castroadvocacia.plataforma.dto;

import java.util.List;
import java.util.Map;

public record PlanilhaStatsDTO(
    int totalLinhas,
    List<KpiDTO> kpis,
    List<GraficoDTO> graficos
) {
    public record KpiDTO(String coluna, double soma, double media) {}
    public record GraficoDTO(String coluna, Map<String, Long> distribuicao) {}
}
