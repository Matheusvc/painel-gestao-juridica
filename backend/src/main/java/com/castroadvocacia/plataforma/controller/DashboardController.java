package com.castroadvocacia.plataforma.controller;

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
    public DashboardDTO estatisticas() {
        return service.obterEstatisticas();
    }

    @GetMapping("/detalhes-mes")
    public DashboardDTO.MonthDetailDTO detalhesMes(
            @RequestParam String ano,
            @RequestParam int mes) {
        return service.detalhesMes(ano, mes);
    }
}
