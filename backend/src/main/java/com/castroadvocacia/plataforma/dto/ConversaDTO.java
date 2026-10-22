package com.castroadvocacia.plataforma.dto;

import java.util.List;

public record ConversaDTO(
    String id,
    ContatoDTO contact,
    String lastMessage,
    long lastTime,
    int unread,
    List<MensagemDTO> messages
) {}
