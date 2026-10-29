package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.DashboardDTO;
import com.castroadvocacia.plataforma.dto.DashboardDTO.*;
import com.castroadvocacia.plataforma.model.*;
import com.castroadvocacia.plataforma.repository.ProcessoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProcessoRepository processoRepo;

    private static final Map<String, Integer> MONTH_MAP;
    static {
        var m = new HashMap<String, Integer>();
        String[][] entries = {
            {"janeiro","jan","1"}, {"fevereiro","fev","2"},
            {"março","mar","marco","3"}, {"abril","abr","4"},
            {"maio","mai","5"}, {"junho","jun","6"},
            {"julho","jul","7"}, {"agosto","ago","8"},
            {"setembro","set","9"}, {"outubro","out","10"},
            {"novembro","nov","11"}, {"dezembro","dez","12"}
        };
        for (int i = 0; i < entries.length; i++) {
            for (String key : entries[i]) m.put(key, i + 1);
        }
        MONTH_MAP = Map.copyOf(m);
    }

    private static final String[] MONTH_ABBR = {
        "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };

    private int parseMonth(String mes) {
        if (mes == null || mes.isBlank()) return 0;
        Integer v = MONTH_MAP.get(mes.toLowerCase().trim());
        if (v != null) return v;
        try {
            int n = Integer.parseInt(mes.trim());
            return n >= 1 && n <= 12 ? n : 0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String sortKey(String ano, String mes) {
        String a = ano.trim();
        if (a.length() == 2) a = "20" + a;
        return a + String.format("%02d", parseMonth(mes));
    }

    private String displayLabel(String key) {
        int m = Integer.parseInt(key.substring(4));
        int y = Integer.parseInt(key.substring(2, 4));
        return MONTH_ABBR[m] + "/" + String.format("%02d", y);
    }

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

    public DashboardDTO.MonthDetailDTO detalhesMes(String ano, int mes) {
        var filtrados = processoRepo.findAll().stream()
            .filter(p -> ano.equals(p.getAno() != null ? p.getAno().trim() : ""))
            .filter(p -> parseMonth(p.getMes()) == mes)
            .toList();

        long total = filtrados.size();

        Map<String, Long> porStatus = filtrados.stream()
            .filter(p -> p.getStatus() != null && !p.getStatus().isBlank())
            .collect(Collectors.groupingBy(
                p -> p.getStatus().trim(),
                LinkedHashMap::new,
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));

        List<DashboardDTO.DailyCountDTO> porDia = filtrados.stream()
            .map(p -> {
                String dp = p.getDataProtocolo();
                if (dp != null && !dp.isBlank()) {
                    try { return Integer.parseInt(dp.split("/")[0].trim()); }
                    catch (Exception ignored) {}
                }
                return -1;
            })
            .filter(d -> d > 0 && d <= 31)
            .collect(Collectors.groupingBy(d -> d, TreeMap::new, Collectors.counting()))
            .entrySet().stream()
            .map(e -> new DashboardDTO.DailyCountDTO(e.getKey(), e.getValue()))
            .toList();

        return new DashboardDTO.MonthDetailDTO(total, porStatus, porDia);
    }

    private boolean isEncerrado(String status) {
        if (status == null) return false;
        String upper = status.toUpperCase().trim();
        return upper.equals("RECEBIDA") || upper.equals("RECEBIDO")
            || upper.equals("ENCERRADO") || upper.equals("ARQUIVO MORTO");
    }

    public DashboardDTO obterEstatisticas() {
        var todosProcessos = processoRepo.findAll();

        // --- Clientes derivados diretamente dos processos (planilha) ---
        Set<String> todosClientes = todosProcessos.stream()
            .map(Processo::getCliente)
            .filter(c -> c != null && !c.isBlank())
            .map(c -> c.trim().toUpperCase())
            .collect(Collectors.toSet());

        Set<String> clientesAtivos = todosProcessos.stream()
            .filter(p -> !isEncerrado(p.getStatus()))
            .map(Processo::getCliente)
            .filter(c -> c != null && !c.isBlank())
            .map(c -> c.trim().toUpperCase())
            .collect(Collectors.toSet());

        Set<String> clientesEncerrados = new HashSet<>(todosClientes);
        clientesEncerrados.removeAll(clientesAtivos);

        int totalClientes = todosClientes.size();
        int ativos = clientesAtivos.size();
        int inativos = clientesEncerrados.size();
        int pendentes = (int) todosProcessos.stream()
            .filter(p -> {
                String s = p.getStatus();
                return s != null && (s.equalsIgnoreCase("PENDENTE") || s.toUpperCase().contains("PENDENTE"));
            })
            .map(Processo::getCliente)
            .filter(c -> c != null && !c.isBlank())
            .map(c -> c.trim().toUpperCase())
            .distinct()
            .count();

        // --- Status dos processos (planilha) para KPI de serviços ---
        int totalServicos = todosProcessos.size();
        int abertos = (int) todosProcessos.stream()
            .filter(p -> p.getStatus() != null && p.getStatus().equalsIgnoreCase("Aberto")).count();
        int emAndamento = (int) todosProcessos.stream()
            .filter(p -> {
                String s = p.getStatus();
                if (s == null) return false;
                String upper = s.toUpperCase();
                return upper.contains("ANDAMENTO") || upper.contains("TRAMITANDO") || upper.contains("ATENDIMENTO");
            }).count();
        int concluidos = (int) todosProcessos.stream()
            .filter(p -> isEncerrado(p.getStatus())).count();
        int emAnalise = (int) todosProcessos.stream()
            .filter(p -> {
                String s = p.getStatus();
                return s != null && s.toUpperCase().contains("ANÁLISE");
            }).count();

        // --- Processos agrupados por categoria/aba/status (planilha) ---
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

        // --- Corretores (planilha) ---
        Map<String, Long> corretores = new LinkedHashMap<>();
        for (Object[] row : processoRepo.countClientesPorCorretor()) {
            corretores.put((String) row[0], (Long) row[1]);
        }

        // --- Status agregado direto dos processos (planilha) ---
        Map<String, Long> servicosPorStatus = todosProcessos.stream()
            .filter(p -> p.getStatus() != null && !p.getStatus().isBlank())
            .collect(Collectors.groupingBy(
                p -> p.getStatus().trim(),
                LinkedHashMap::new,
                Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));

        // --- Valores financeiros (planilha) ---
        BigDecimal totalRecebido = todosProcessos.stream()
            .filter(p -> isEncerrado(p.getStatus()))
            .filter(p -> p.getValor() != null && !p.getValor().isBlank())
            .map(p -> parseValor(p.getValor()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAReceber = todosProcessos.stream()
            .filter(p -> !isEncerrado(p.getStatus()))
            .filter(p -> p.getValor() != null && !p.getValor().isBlank())
            .map(p -> parseValor(p.getValor()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int encerrados = (int) todosProcessos.stream()
            .filter(p -> isEncerrado(p.getStatus()))
            .count();

        // --- Evolução mensal (planilha: campos ANO + MÊS) ---
        List<DashboardDTO.MonthlyCountDTO> processosPorMes = todosProcessos.stream()
            .filter(p -> p.getAno() != null && !p.getAno().isBlank()
                      && p.getMes() != null && !p.getMes().isBlank())
            .filter(p -> parseMonth(p.getMes()) > 0)
            .collect(Collectors.groupingBy(
                p -> sortKey(p.getAno(), p.getMes()),
                TreeMap::new,
                Collectors.counting()
            ))
            .entrySet().stream()
            .map(e -> new DashboardDTO.MonthlyCountDTO(displayLabel(e.getKey()), e.getValue()))
            .toList();

        // --- Valor recebido por mês (planilha: campos ANO + MÊS + VALOR + STATUS) ---
        List<DashboardDTO.MonthlyValueDTO> valorRecebidoPorMes = todosProcessos.stream()
            .filter(p -> isEncerrado(p.getStatus()))
            .filter(p -> p.getAno() != null && !p.getAno().isBlank()
                      && p.getMes() != null && !p.getMes().isBlank())
            .filter(p -> parseMonth(p.getMes()) > 0)
            .filter(p -> p.getValor() != null && !p.getValor().isBlank())
            .collect(Collectors.groupingBy(
                p -> sortKey(p.getAno(), p.getMes()),
                TreeMap::new,
                Collectors.mapping(
                    p -> parseValor(p.getValor()),
                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                )
            ))
            .entrySet().stream()
            .map(e -> new DashboardDTO.MonthlyValueDTO(displayLabel(e.getKey()), e.getValue()))
            .toList();

        // --- Valor por categoria (planilha: campos CATEGORIA + VALOR) ---
        Map<String, BigDecimal> valorPorCategoria = todosProcessos.stream()
            .filter(p -> p.getCategoria() != null && !p.getCategoria().isBlank())
            .filter(p -> p.getValor() != null && !p.getValor().isBlank())
            .collect(Collectors.groupingBy(
                p -> p.getCategoria().trim(),
                LinkedHashMap::new,
                Collectors.mapping(
                    p -> parseValor(p.getValor()),
                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                )
            ))
            .entrySet().stream()
            .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) > 0)
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));

        return new DashboardDTO(
            new ClienteStatsDTO(totalClientes, ativos, inativos, pendentes),
            new ServicoStatsDTO(totalServicos, abertos, emAndamento, concluidos, emAnalise),
            processos,
            corretores,
            servicosPorStatus,
            totalRecebido,
            totalAReceber,
            encerrados,
            processosPorMes,
            valorRecebidoPorMes,
            valorPorCategoria
        );
    }
}
