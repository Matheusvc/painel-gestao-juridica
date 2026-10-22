package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.dto.ContatoDTO;
import com.castroadvocacia.plataforma.dto.ConversaDTO;
import com.castroadvocacia.plataforma.dto.MensagemDTO;
import com.castroadvocacia.plataforma.dto.MensagemRequest;
import com.castroadvocacia.plataforma.model.Conversa;
import com.castroadvocacia.plataforma.model.Mensagem;
import com.castroadvocacia.plataforma.repository.ConversaRepository;
import com.castroadvocacia.plataforma.repository.MensagemRepository;
import com.castroadvocacia.plataforma.util.Iniciais;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConversaService {

    private final ConversaRepository conversaRepo;
    private final MensagemRepository mensagemRepo;

    public List<ConversaDTO> listar() {
        return conversaRepo.findAll().stream().map(this::toDTO).toList();
    }

    public ConversaDTO buscarPorId(UUID id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public MensagemDTO enviarMensagem(UUID conversaId, MensagemRequest req) {
        var conversa = findOrThrow(conversaId);

        var msg = new Mensagem();
        msg.setTexto(req.text());
        msg.setAutor(Mensagem.Autor.ATENDENTE);
        msg.setConversa(conversa);
        mensagemRepo.save(msg);

        conversa.setNaoLidas(0);
        conversaRepo.save(conversa);

        return toMensagemDTO(msg);
    }

    public List<MensagemDTO> listarMensagens(UUID conversaId) {
        if (!conversaRepo.existsById(conversaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversa nao encontrada");
        }
        return mensagemRepo.findByConversaIdOrderByCriadoEmAsc(conversaId)
            .stream().map(this::toMensagemDTO).toList();
    }

    private Conversa findOrThrow(UUID id) {
        return conversaRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversa nao encontrada"));
    }

    private ConversaDTO toDTO(Conversa c) {
        var mensagens = c.getMensagens().stream().map(this::toMensagemDTO).toList();
        Mensagem ultima = c.getMensagens().isEmpty() ? null : c.getMensagens().get(c.getMensagens().size() - 1);
        return new ConversaDTO(
            c.getId().toString(),
            new ContatoDTO(
                c.getNomeContato(),
                Iniciais.fromNome(c.getNomeContato()),
                c.getCargoContato(),
                c.isOnline()
            ),
            ultima != null ? ultima.getTexto() : "",
            ultima != null ? ultima.getCriadoEm().toInstant(ZoneOffset.of("-03:00")).toEpochMilli() : 0L,
            c.getNaoLidas(),
            mensagens
        );
    }

    private MensagemDTO toMensagemDTO(Mensagem m) {
        String author = m.getAutor() == Mensagem.Autor.ATENDENTE ? "me" : "them";
        String status = m.getAutor() == Mensagem.Autor.ATENDENTE ? "sent" : null;
        return new MensagemDTO(
            m.getId().toString(),
            author,
            m.getTexto(),
            m.getCriadoEm().toInstant(ZoneOffset.of("-03:00")).toEpochMilli(),
            status
        );
    }
}
