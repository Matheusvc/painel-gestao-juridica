package com.castroadvocacia.plataforma.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardDTO(
    ClienteStatsDTO clients,
    ServicoStatsDTO services,
    Map<String, Map<String, Long>> processos,
    Map<String, Long> corretores,
    Map<String, Long> servicosPorStatus,
    BigDecimal totalRecebido,
    BigDecimal totalAReceber,
    int encerrados,
    List<MonthlyCountDTO> processosPorMes,
    List<MonthlyValueDTO> valorRecebidoPorMes,
    Map<String, BigDecimal> valorPorCategoria
) {

    public record ClienteStatsDTO(int total, int active, int inactive, int pending) {}

    public record ServicoStatsDTO(int total, int open, int progress, int done, int analise) {}

    public record MonthlyCountDTO(String mes, long total) {}

    public record MonthlyValueDTO(String mes, BigDecimal valor) {}

    public record DailyCountDTO(int dia, long total) {}

    public record MonthDetailDTO(
        long total,
        Map<String, Long> porStatus,
        List<DailyCountDTO> porDia
    ) {}
}
