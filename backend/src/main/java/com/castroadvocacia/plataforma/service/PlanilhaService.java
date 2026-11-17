package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.PlanilhaDataDTO;
import com.castroadvocacia.plataforma.dto.PlanilhaStatsDTO;
import com.castroadvocacia.plataforma.model.PlanilhaMeta;
import com.castroadvocacia.plataforma.model.Processo;
import com.castroadvocacia.plataforma.repository.PlanilhaMetaRepository;
import com.castroadvocacia.plataforma.repository.ProcessoRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanilhaService {

    private final ProcessoRepository processoRepo;
    private final PlanilhaMetaRepository metaRepo;
    private final ObjectMapper objectMapper;

    private static final TypeReference<Map<String, String>> MAP_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<Map<String, String>>> LIST_MAP_TYPE = new TypeReference<>() {};

    public List<Map<String, String>> obterColunas(String categoria, UUID usuarioId) {
        return metaRepo.findByCategoriaAndUsuarioIdOrLegacy(categoria, usuarioId)
            .map(this::parseColunas)
            .orElse(Collections.emptyList());
    }

    public PlanilhaDataDTO obterDados(String categoria, UUID usuarioId, int pagina, int tamanho) {
        List<Map<String, String>> colunas = obterColunas(categoria, usuarioId);
        List<Processo> processos = processoRepo.findByCategoriaAndUsuarioIdOrLegacy(categoria, usuarioId);

        List<Map<String, String>> todasLinhas = new ArrayList<>();
        for (Processo p : processos) {
            if (p.getDados() != null) {
                try {
                    todasLinhas.add(objectMapper.readValue(p.getDados(), MAP_TYPE));
                } catch (Exception ignored) {}
            }
        }

        int total = todasLinhas.size();
        int inicio = pagina * tamanho;
        int fim = Math.min(inicio + tamanho, total);
        List<Map<String, String>> paginada = inicio < total ? todasLinhas.subList(inicio, fim) : Collections.emptyList();

        return new PlanilhaDataDTO(categoria, colunas, paginada, total, pagina, tamanho);
    }

    public PlanilhaStatsDTO obterStats(String categoria, UUID usuarioId) {
        List<Map<String, String>> colunas = obterColunas(categoria, usuarioId);
        List<Processo> processos = processoRepo.findByCategoriaAndUsuarioIdOrLegacy(categoria, usuarioId);

        List<Map<String, String>> registros = new ArrayList<>();
        for (Processo p : processos) {
            if (p.getDados() != null) {
                try {
                    registros.add(objectMapper.readValue(p.getDados(), MAP_TYPE));
                } catch (Exception ignored) {}
            }
        }

        List<PlanilhaStatsDTO.KpiDTO> kpis = new ArrayList<>();
        List<PlanilhaStatsDTO.GraficoDTO> graficos = new ArrayList<>();

        for (Map<String, String> col : colunas) {
            String nome = col.get("nome");
            String tipo = col.get("tipo");

            if ("MONETARIO".equals(tipo) || "NUMERICO".equals(tipo)) {
                double soma = 0;
                int count = 0;
                for (Map<String, String> reg : registros) {
                    String val = reg.get(nome);
                    if (val != null) {
                        double parsed = parseNumero(val);
                        if (!Double.isNaN(parsed)) {
                            soma += parsed;
                            count++;
                        }
                    }
                }
                if (count > 0) {
                    kpis.add(new PlanilhaStatsDTO.KpiDTO(nome, soma, soma / count));
                }
            }

            if ("STATUS".equals(tipo)) {
                Map<String, Long> dist = new LinkedHashMap<>();
                for (Map<String, String> reg : registros) {
                    String val = reg.get(nome);
                    if (val != null && !val.isBlank()) {
                        dist.merge(val, 1L, Long::sum);
                    }
                }
                if (!dist.isEmpty()) {
                    graficos.add(new PlanilhaStatsDTO.GraficoDTO(nome, dist));
                }
            }
        }

        return new PlanilhaStatsDTO(registros.size(), kpis, graficos);
    }

    private double parseNumero(String valor) {
        if (valor == null || valor.isBlank()) return Double.NaN;
        String clean = valor.replace("R$", "").replace(" ", "").trim();
        if (clean.contains(",")) {
            clean = clean.replace(".", "").replace(",", ".");
        }
        try {
            return Double.parseDouble(clean);
        } catch (NumberFormatException e) {
            return Double.NaN;
        }
    }

    private List<Map<String, String>> parseColunas(PlanilhaMeta meta) {
        try {
            return objectMapper.readValue(meta.getColunas(), LIST_MAP_TYPE);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
