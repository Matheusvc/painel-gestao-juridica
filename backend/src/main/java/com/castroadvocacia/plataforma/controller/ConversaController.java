package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.ConversaDTO;
import com.castroadvocacia.plataforma.dto.MensagemDTO;
import com.castroadvocacia.plataforma.dto.MensagemRequest;
import com.castroadvocacia.plataforma.service.ConversaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversaController {

    private final ConversaService service;

    @GetMapping
    public List<ConversaDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ConversaDTO buscar(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/{id}/messages")
    public List<MensagemDTO> listarMensagens(@PathVariable UUID id) {
        return service.listarMensagens(id);
    }

    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemDTO enviarMensagem(@PathVariable UUID id, @Valid @RequestBody MensagemRequest req) {
        return service.enviarMensagem(id, req);
    }
}
