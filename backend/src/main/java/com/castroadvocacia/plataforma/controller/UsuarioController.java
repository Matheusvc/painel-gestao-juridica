package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.model.Usuario;
import com.castroadvocacia.plataforma.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    @GetMapping
    public List<Map<String, Object>> listar() {
        return repo.findAll().stream()
            .map(this::toMap)
            .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, String> body) {
        String nome = body.get("nome");
        String email = body.get("email");
        String senha = body.get("senha");
        String perfil = body.getOrDefault("perfil", "ATENDENTE");

        if (nome == null || email == null || senha == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nome, email e senha são obrigatórios"));
        }

        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email já cadastrado"));
        }

        var u = new Usuario();
        u.setNome(nome.trim());
        u.setEmail(email.trim().toLowerCase());
        u.setSenha(encoder.encode(senha));
        u.setPerfil(Usuario.Perfil.valueOf(perfil));
        if (body.get("cargo") != null) u.setCargo(body.get("cargo"));

        repo.save(u);
        return ResponseEntity.ok(toMap(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        var u = opt.get();
        if (body.containsKey("nome")) u.setNome(body.get("nome").trim());
        if (body.containsKey("email")) {
            String novoEmail = body.get("email").trim().toLowerCase();
            var existing = repo.findByEmail(novoEmail);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email já cadastrado"));
            }
            u.setEmail(novoEmail);
        }
        if (body.containsKey("senha") && !body.get("senha").isBlank()) {
            u.setSenha(encoder.encode(body.get("senha")));
        }
        if (body.containsKey("perfil")) u.setPerfil(Usuario.Perfil.valueOf(body.get("perfil")));
        if (body.containsKey("cargo")) u.setCargo(body.get("cargo"));

        repo.save(u);
        return ResponseEntity.ok(toMap(u));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable UUID id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Usuario u) {
        var m = new LinkedHashMap<String, Object>();
        m.put("id", u.getId().toString());
        m.put("nome", u.getNome());
        m.put("email", u.getEmail());
        m.put("perfil", u.getPerfil().name());
        m.put("cargo", u.getCargo() != null ? u.getCargo() : "");
        m.put("criadoEm", u.getCriadoEm().toString());
        return m;
    }
}
