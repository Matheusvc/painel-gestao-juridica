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

    public List<ClienteDTO> listar() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public ClienteDTO buscarPorId(UUID id) {
        return toDTO(findOrThrow(id));
    }

    public ClienteDTO criar(ClienteRequest req) {
        var c = new Cliente();
        c.setNome(req.name());
        c.setCpf(req.cpf());
        c.setNumeroProcesso(req.processNumber());
        return toDTO(repo.save(c));
    }

    public ClienteDTO atualizar(UUID id, ClienteRequest req) {
        var c = findOrThrow(id);
        c.setNome(req.name());
        c.setCpf(req.cpf());
        c.setNumeroProcesso(req.processNumber());
        return toDTO(repo.save(c));
    }

    public void excluir(UUID id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado");
        }
        repo.deleteById(id);
    }

    private Cliente findOrThrow(UUID id) {
        return repo.findById(id)
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
