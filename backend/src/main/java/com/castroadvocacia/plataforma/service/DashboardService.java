package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.DashboardDTO;
import com.castroadvocacia.plataforma.dto.DashboardDTO.*;
import com.castroadvocacia.plataforma.model.*;
import com.castroadvocacia.plataforma.repository.ClienteRepository;
import com.castroadvocacia.plataforma.repository.ProcessoRepository;
import com.castroadvocacia.plataforma.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClienteRepository clienteRepo;
    private final ServicoRepository servicoRepo;
    private final ProcessoRepository processoRepo;

    public DashboardDTO obterEstatisticas() {
        var clientes = clienteRepo.findAll();
        int totalClientes = clientes.size();
        int ativos = (int) clientes.stream().filter(c -> c.getStatus() == StatusCliente.ATIVO).count();
        int inativos = (int) clientes.stream().filter(c -> c.getStatus() == StatusCliente.INATIVO).count();
        int pendentes = (int) clientes.stream().filter(c -> c.getStatus() == StatusCliente.PENDENTE).count();

        var servicos = servicoRepo.findAll();
        int totalServicos = servicos.size();
        int abertos = (int) servicos.stream().filter(s -> s.getStatus() == StatusServico.ABERTO).count();
        int emAndamento = (int) servicos.stream().filter(s -> s.getStatus() == StatusServico.EM_ANDAMENTO).count();
        int concluidos = (int) servicos.stream().filter(s -> s.getStatus() == StatusServico.CONCLUIDO).count();
        int emAnalise = (int) servicos.stream().filter(s -> s.getStatus() == StatusServico.EM_ANALISE).count();

        Map<String, Map<String, Long>> processos = new LinkedHashMap<>();
        for (String categoria : processoRepo.findDistinctCategorias()) {
            var procs = processoRepo.findByCategoria(categoria);

            long distinctAbas = procs.stream()
                .map(Processo::getAba)
                .filter(a -> a != null && !a.isBlank())
                .distinct()
                .count();

            Map<String, Long> counts;
            if (distinctAbas > 1) {
                counts = procs.stream()
                    .filter(p -> p.getAba() != null && !p.getAba().isBlank())
                    .collect(Collectors.groupingBy(Processo::getAba, LinkedHashMap::new, Collectors.counting()));
            } else {
                counts = procs.stream()
                    .filter(p -> p.getStatus() != null && !p.getStatus().isBlank())
                    .collect(Collectors.groupingBy(Processo::getStatus, LinkedHashMap::new, Collectors.counting()));
            }
            processos.put(categoria, counts);
        }

        return new DashboardDTO(
            new ClienteStatsDTO(totalClientes, ativos, inativos, pendentes),
            new ServicoStatsDTO(totalServicos, abertos, emAndamento, concluidos, emAnalise),
            processos
        );
    }
}
