package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.ClienteDTO;
import com.castroadvocacia.plataforma.dto.ClienteRequest;
import com.castroadvocacia.plataforma.model.Cliente;
import com.castroadvocacia.plataforma.repository.ClienteRepository;
import com.castroadvocacia.plataforma.util.Iniciais;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repo;

    public List<ClienteDTO> listar(UUID usuarioId) {
        return repo.findByUsuarioIdOrLegacy(usuarioId).stream().map(this::toDTO).toList();
    }

    public ClienteDTO buscarPorId(UUID id, UUID usuarioId) {
        return toDTO(findOrThrow(id, usuarioId));
    }

    public ClienteDTO criar(ClienteRequest req, UUID usuarioId) {
        var c = new Cliente();
        c.setUsuarioId(usuarioId);
        applyRequest(c, req);
        return toDTO(repo.save(c));
    }

    public ClienteDTO atualizar(UUID id, ClienteRequest req, UUID usuarioId) {
        var c = findOrThrow(id, usuarioId);
        applyRequest(c, req);
        return toDTO(repo.save(c));
    }

    public void removerTodos(UUID usuarioId) {
        repo.deleteAll(repo.findByUsuarioIdOrLegacy(usuarioId));
    }

    public void excluir(UUID id, UUID usuarioId) {
        repo.delete(findOrThrow(id, usuarioId));
    }

    private void applyRequest(Cliente c, ClienteRequest req) {
        c.setNome(req.name());
        c.setCpf(req.cpf());
        c.setNumeroProcesso(req.processNumber());
    }

    private Cliente findOrThrow(UUID id, UUID usuarioId) {
        return repo.findById(id)
            .filter(c -> c.getUsuarioId() == null || c.getUsuarioId().equals(usuarioId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));
    }

    private ClienteDTO toDTO(Cliente c) {
        return new ClienteDTO(
            c.getId().toString(),
            c.getNome(),
            Iniciais.fromNome(c.getNome()),
            c.getCpf(),
            c.getNumeroProcesso()
        );
    }
}
