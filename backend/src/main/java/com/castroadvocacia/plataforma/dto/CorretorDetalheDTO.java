package com.castroadvocacia.plataforma.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record CorretorDetalheDTO(
    String corretor,
    int totalClientes,
    int totalProcessos,
    BigDecimal valorTotal,
    Map<String, Long> processosPorStatus,
    Map<String, Long> processosPorBeneficio,
    List<ClienteResumoDTO> clientes
) {
    public record ClienteResumoDTO(
        String nome,
        String cpf,
        String beneficio,
        String status,
        String valor,
        String dataProtocolo
    ) {}
}
