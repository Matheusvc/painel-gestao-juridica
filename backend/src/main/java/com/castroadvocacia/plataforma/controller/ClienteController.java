package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.ClienteDTO;
import com.castroadvocacia.plataforma.dto.ClienteRequest;
import com.castroadvocacia.plataforma.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService service;

    @GetMapping
    public List<ClienteDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ClienteDTO buscar(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteDTO criar(@Valid @RequestBody ClienteRequest req) {
        return service.criar(req);
    }

    @PutMapping("/{id}")
    public ClienteDTO atualizar(@PathVariable UUID id, @Valid @RequestBody ClienteRequest req) {
        return service.atualizar(id, req);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerTodos() {
        service.removerTodos();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) {
        service.excluir(id);
    }
}
