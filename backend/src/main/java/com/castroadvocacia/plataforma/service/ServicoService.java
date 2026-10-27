package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.ResponsavelDTO;
import com.castroadvocacia.plataforma.dto.ServicoDTO;
import com.castroadvocacia.plataforma.dto.ServicoRequest;
import com.castroadvocacia.plataforma.model.Servico;
import com.castroadvocacia.plataforma.repository.ServicoRepository;
import com.castroadvocacia.plataforma.util.Iniciais;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository repo;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yy HH:mm");
    private static final Locale PT_BR = Locale.of("pt", "BR");

    public List<ServicoDTO> listar() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public List<ServicoDTO> listarPorCategoria(String categoria) {
        return repo.findByCategoria(categoria).stream().map(this::toDTO).toList();
    }

    public List<String> listarCategorias() {
        return repo.findAll().stream()
            .map(Servico::getCategoria)
            .filter(c -> c != null && !c.isBlank())
            .distinct()
            .toList();
    }

    public ServicoDTO buscarPorId(UUID id) {
        return toDTO(findOrThrow(id));
    }

    public ServicoDTO criar(ServicoRequest req) {
        var s = new Servico();
        s.setNumero(proximoNumero());
        applyRequest(s, req);
        return toDTO(repo.save(s));
    }

    public ServicoDTO atualizar(UUID id, ServicoRequest req) {
        var s = findOrThrow(id);
        applyRequest(s, req);
        return toDTO(repo.save(s));
    }

    public long contarPorStatus(String status) {
        return repo.findAll().stream().filter(s -> s.getStatus().equalsIgnoreCase(status)).count();
    }

    public List<String> listarStatuses() {
        return repo.findAll().stream()
            .map(Servico::getStatus)
            .distinct()
            .toList();
    }

    public void removerTodos() {
        repo.deleteAll();
    }

    private void applyRequest(Servico s, ServicoRequest req) {
        s.setTitulo(req.title());
        s.setTipoServico(req.service());
        s.setValorTotal(parseTotal(req.total()));
        s.setResponsavel(req.ownerName());
        s.setStatus(req.status());
    }

    private Integer proximoNumero() {
        return repo.findAll().stream()
            .map(Servico::getNumero)
            .filter(n -> n != null)
            .max(Integer::compareTo)
            .orElse(0) + 1;
    }

    private Servico findOrThrow(UUID id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servico nao encontrado"));
    }

    private ServicoDTO toDTO(Servico s) {
        return new ServicoDTO(
            String.format("%05d", s.getNumero()),
            s.getAtualizadoEm().format(FMT),
            s.getTitulo(),
            s.getTipoServico(),
            formatTotal(s.getValorTotal()),
            new ResponsavelDTO(s.getResponsavel(), Iniciais.fromNome(s.getResponsavel())),
            s.getStatus(),
            s.getCategoria()
        );
    }

    private String formatTotal(BigDecimal valor) {
        if (valor == null) return "R$ 0,00";
        NumberFormat nf = NumberFormat.getCurrencyInstance(PT_BR);
        return nf.format(valor).replace(' ', ' ');
    }

    private BigDecimal parseTotal(String total) {
        if (total == null || total.isBlank()) return BigDecimal.ZERO;
        String clean = total
            .replace("R$", "")
            .replace(" ", "")
            .replace(".", "")
            .replace(",", ".")
            .trim();
        try {
            return new BigDecimal(clean);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }
}
