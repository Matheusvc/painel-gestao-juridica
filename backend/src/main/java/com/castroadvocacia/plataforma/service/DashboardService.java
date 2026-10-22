package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.DashboardDTO;
import com.castroadvocacia.plataforma.dto.DashboardDTO.*;
import com.castroadvocacia.plataforma.model.StatusCliente;
import com.castroadvocacia.plataforma.model.StatusServico;
import com.castroadvocacia.plataforma.repository.ClienteRepository;
import com.castroadvocacia.plataforma.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClienteRepository clienteRepo;
    private final ServicoRepository servicoRepo;

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

        return new DashboardDTO(
            new ClienteStatsDTO(totalClientes, ativos, inativos, pendentes),
            new ClienteDeltasDTO(12, 9, -4, 6),
            new ServicoStatsDTO(totalServicos, abertos, emAndamento, concluidos, emAnalise),
            new ProcessoStatsDTO(46, 14, 18, 9, 5)
        );
    }
}
