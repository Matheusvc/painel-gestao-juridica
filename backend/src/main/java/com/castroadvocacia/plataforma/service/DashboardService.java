package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.DashboardDTO;
import com.castroadvocacia.plataforma.dto.DashboardDTO.*;
import com.castroadvocacia.plataforma.model.*;
import com.castroadvocacia.plataforma.repository.ClienteRepository;
import com.castroadvocacia.plataforma.repository.ProcessoRepository;
import com.castroadvocacia.plataforma.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClienteRepository clienteRepo;
    private final ServicoRepository servicoRepo;
    private final ProcessoRepository processoRepo;

    private BigDecimal parseValor(String valor) {
        if (valor == null || valor.isBlank()) return BigDecimal.ZERO;
        String clean = valor
            .replace("R$", "")
            .replace(" ", "")
            .trim();
        if (clean.contains(",")) {
            clean = clean.replace(".", "").replace(",", ".");
        }
        try {
            return new BigDecimal(clean);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    public DashboardDTO obterEstatisticas() {
        var clientes = clienteRepo.findAll();
        int totalClientes = clientes.size();
        int ativos = (int) clientes.stream().filter(c -> c.getStatus() == StatusCliente.ATIVO).count();
        int inativos = (int) clientes.stream().filter(c -> c.getStatus() == StatusCliente.INATIVO).count();
        int pendentes = (int) clientes.stream().filter(c -> c.getStatus() == StatusCliente.PENDENTE).count();

        var servicos = servicoRepo.findAll();
        int totalServicos = servicos.size();
        int abertos = (int) servicos.stream().filter(s -> "Aberto".equalsIgnoreCase(s.getStatus())).count();
        int emAndamento = (int) servicos.stream().filter(s -> "Em Atendimento".equalsIgnoreCase(s.getStatus())).count();
        int concluidos = (int) servicos.stream().filter(s -> "Encerrado".equalsIgnoreCase(s.getStatus())).count();
        int emAnalise = (int) servicos.stream().filter(s -> "Em Análise".equalsIgnoreCase(s.getStatus())).count();

        Map<String, Map<String, Long>> processos = new LinkedHashMap<>();
        for (String categoria : processoRepo.findDistinctCategorias()) {
            var procs = processoRepo.findByCategoria(categoria);

            var abasDistintas = procs.stream()
                .map(Processo::getAba)
                .filter(a -> a != null && !a.isBlank())
                .distinct()
                .toList();

            if (abasDistintas.size() > 1) {
                for (String aba : abasDistintas) {
                    Map<String, Long> counts = procs.stream()
                        .filter(p -> aba.equals(p.getAba()))
                        .filter(p -> p.getStatus() != null && !p.getStatus().isBlank())
                        .collect(Collectors.groupingBy(Processo::getStatus, LinkedHashMap::new, Collectors.counting()));
                    if (!counts.isEmpty()) {
                        processos.put(categoria + " — " + aba, counts);
                    }
                }
            } else {
                Map<String, Long> counts = procs.stream()
                    .filter(p -> p.getStatus() != null && !p.getStatus().isBlank())
                    .collect(Collectors.groupingBy(Processo::getStatus, LinkedHashMap::new, Collectors.counting()));
                processos.put(categoria, counts);
            }
        }

        Map<String, Long> corretores = new LinkedHashMap<>();
        for (Object[] row : processoRepo.countClientesPorCorretor()) {
            corretores.put((String) row[0], (Long) row[1]);
        }

        Map<String, Long> servicosPorStatus = servicos.stream()
            .filter(s -> s.getStatus() != null && !s.getStatus().isBlank())
            .collect(Collectors.groupingBy(
                Servico::getStatus,
                LinkedHashMap::new,
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));

        var todosProcessos = processoRepo.findAll();

        BigDecimal totalRecebido = todosProcessos.stream()
            .filter(p -> "RECEBIDA".equalsIgnoreCase(p.getStatus())
                      || "RECEBIDO".equalsIgnoreCase(p.getStatus()))
            .map(p -> parseValor(p.getValor()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAReceber = todosProcessos.stream()
            .filter(p -> !"RECEBIDA".equalsIgnoreCase(p.getStatus())
                      && !"RECEBIDO".equalsIgnoreCase(p.getStatus()))
            .filter(p -> p.getValor() != null && !p.getValor().isBlank())
            .map(p -> parseValor(p.getValor()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int encerrados = (int) todosProcessos.stream()
            .filter(p -> "RECEBIDA".equalsIgnoreCase(p.getStatus())
                      || "RECEBIDO".equalsIgnoreCase(p.getStatus()))
            .count();

        return new DashboardDTO(
            new ClienteStatsDTO(totalClientes, ativos, inativos, pendentes),
            new ServicoStatsDTO(totalServicos, abertos, emAndamento, concluidos, emAnalise),
            processos,
            corretores,
            servicosPorStatus,
            totalRecebido,
            totalAReceber,
            encerrados
        );
    }
}
