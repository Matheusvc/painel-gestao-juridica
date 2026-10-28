package com.castroadvocacia.plataforma.dto;

import java.util.Map;

public record DashboardDTO(
    ClienteStatsDTO clients,
    ServicoStatsDTO services,
    Map<String, Map<String, Long>> processos,
    Map<String, Long> corretores,
    Map<String, Long> servicosPorStatus,
    java.math.BigDecimal totalRecebido,
    java.math.BigDecimal totalAReceber,
    int encerrados
) {

    public record ClienteStatsDTO(int total, int active, int inactive, int pending) {}

    public record ServicoStatsDTO(int total, int open, int progress, int done, int analise) {}
}
