package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.ServicoDTO;
import com.castroadvocacia.plataforma.dto.ServicoRequest;
import com.castroadvocacia.plataforma.service.ServicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoService service;

    @GetMapping
    public List<ServicoDTO> listar(@RequestParam(required = false) String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return service.listarPorCategoria(categoria);
        }
        return service.listar();
    }

    @GetMapping("/categorias")
    public List<String> categorias() {
        return service.listarCategorias();
    }

    @GetMapping("/statuses")
    public List<String> statuses() {
        return service.listarStatuses();
    }

    @GetMapping("/{id}")
    public ServicoDTO buscar(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServicoDTO criar(@Valid @RequestBody ServicoRequest req) {
        return service.criar(req);
    }

    @PutMapping("/{id}")
    public ServicoDTO atualizar(@PathVariable UUID id, @Valid @RequestBody ServicoRequest req) {
        return service.atualizar(id, req);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerTodos() {
        service.removerTodos();
    }
}
