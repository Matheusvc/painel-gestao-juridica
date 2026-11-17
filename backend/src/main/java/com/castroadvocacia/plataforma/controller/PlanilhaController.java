package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.PlanilhaDataDTO;
import com.castroadvocacia.plataforma.dto.PlanilhaStatsDTO;
import com.castroadvocacia.plataforma.security.AuthHelper;
import com.castroadvocacia.plataforma.service.PlanilhaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planilha")
@RequiredArgsConstructor
public class PlanilhaController {

    private final PlanilhaService service;
    private final AuthHelper authHelper;

    @GetMapping("/colunas")
    public List<Map<String, String>> colunas(@RequestParam String categoria) {
        return service.obterColunas(categoria, authHelper.getCurrentUsuarioId());
    }

    @GetMapping("/dados")
    public PlanilhaDataDTO dados(
            @RequestParam String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return service.obterDados(categoria, authHelper.getCurrentUsuarioId(), page, size);
    }

    @GetMapping("/stats")
    public PlanilhaStatsDTO stats(@RequestParam String categoria) {
        return service.obterStats(categoria, authHelper.getCurrentUsuarioId());
    }
}
