package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.CorretorDetalheDTO;
import com.castroadvocacia.plataforma.dto.DashboardDTO;
import com.castroadvocacia.plataforma.security.AuthHelper;
import com.castroadvocacia.plataforma.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;
    private final AuthHelper authHelper;

    @GetMapping("/stats")
    public DashboardDTO estatisticas(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano) {
        return service.obterEstatisticas(mes, ano, authHelper.getCurrentUsuarioId());
    }

    @GetMapping("/detalhes-mes")
    public DashboardDTO.MonthDetailDTO detalhesMes(
            @RequestParam String ano,
            @RequestParam int mes) {
        return service.detalhesMes(ano, mes, authHelper.getCurrentUsuarioId());
    }

    @GetMapping("/corretores")
    public List<String> listarCorretores() {
        return service.listarCorretores(authHelper.getCurrentUsuarioId());
    }

    @GetMapping("/corretores/detalhe")
    public CorretorDetalheDTO detalheCorretor(@RequestParam String nome) {
        return service.detalheCorretor(nome, authHelper.getCurrentUsuarioId());
    }
}
