package com.castroadvocacia.plataforma.dto;

public record DashboardDTO(
    ClienteStatsDTO clients,
    ClienteDeltasDTO clientDeltas,
    ServicoStatsDTO services,
    ProcessoStatsDTO processes
) {

    public record ClienteStatsDTO(int total, int active, int inactive, int pending) {}

    public record ClienteDeltasDTO(int total, int active, int inactive, int pending) {}

    public record ServicoStatsDTO(int total, int open, int progress, int done, int analise) {}

    public record ProcessoStatsDTO(int total, int open, int inAnalysis, int done, int pending) {}
}
