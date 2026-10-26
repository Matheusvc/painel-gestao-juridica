package com.castroadvocacia.plataforma.controller;

import com.castroadvocacia.plataforma.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> importar(@RequestParam("file") MultipartFile file) {
        try {
            var result = importService.importar(file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "categoria", result.categoria(),
                "total", result.total()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Erro ao processar planilha"));
        }
    }

    @GetMapping("/categorias")
    public List<String> listarCategorias() {
        return importService.listarCategorias();
    }

    @DeleteMapping("/{categoria}")
    public ResponseEntity<Void> removerCategoria(@PathVariable String categoria) {
        importService.removerCategoria(categoria);
        return ResponseEntity.noContent().build();
    }
}
