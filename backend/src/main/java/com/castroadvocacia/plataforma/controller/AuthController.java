package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.dto.AuthRequest;
import com.castroadvocacia.plataforma.dto.AuthResponse;
import com.castroadvocacia.plataforma.dto.PerfilRequest;
import com.castroadvocacia.plataforma.repository.UsuarioRepository;
import com.castroadvocacia.plataforma.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.senha()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "E-mail ou senha incorretos"));
        }

        var usuario = usuarioRepo.findByEmail(req.email()).orElseThrow();
        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getPerfil().name());

        return ResponseEntity.ok(new AuthResponse(
                token,
                usuario.getNome(),
                usuario.getSobrenome(),
                usuario.getEmail(),
                usuario.getPerfil().name(),
                usuario.getCargo(),
                usuario.getFotoUrl()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Não autenticado"));
        }
        String email = authentication.getName();
        var usuario = usuarioRepo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(buildUserMap(usuario));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody PerfilRequest req) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Não autenticado"));
        }
        String email = authentication.getName();
        var usuario = usuarioRepo.findByEmail(email).orElseThrow();

        if (req.nome() != null && !req.nome().isBlank()) usuario.setNome(req.nome());
        if (req.sobrenome() != null) usuario.setSobrenome(req.sobrenome());
        if (req.cargo() != null) usuario.setCargo(req.cargo());
        if (req.fotoUrl() != null) usuario.setFotoUrl(req.fotoUrl());

        usuarioRepo.save(usuario);
        return ResponseEntity.ok(buildUserMap(usuario));
    }

    private Map<String, Object> buildUserMap(com.castroadvocacia.plataforma.model.Usuario u) {
        var map = new java.util.LinkedHashMap<String, Object>();
        map.put("nome", u.getNome());
        map.put("sobrenome", u.getSobrenome() != null ? u.getSobrenome() : "");
        map.put("email", u.getEmail());
        map.put("perfil", u.getPerfil().name());
        map.put("cargo", u.getCargo() != null ? u.getCargo() : "");
        map.put("fotoUrl", u.getFotoUrl() != null ? u.getFotoUrl() : "");
        return map;
    }
}
