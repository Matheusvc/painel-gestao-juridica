package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.CorretorDetalheDTO;
import com.castroadvocacia.plataforma.dto.DashboardDTO;
import com.castroadvocacia.plataforma.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/stats")
    public DashboardDTO estatisticas(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano) {
        return service.obterEstatisticas(mes, ano);
    }

    @GetMapping("/detalhes-mes")
    public DashboardDTO.MonthDetailDTO detalhesMes(
            @RequestParam String ano,
            @RequestParam int mes) {
        return service.detalhesMes(ano, mes);
    }

    @GetMapping("/corretores")
    public List<String> listarCorretores() {
        return service.listarCorretores();
    }

    @GetMapping("/corretores/{nome}")
    public CorretorDetalheDTO detalheCorretor(@PathVariable String nome) {
        return service.detalheCorretor(nome);
    }
}
