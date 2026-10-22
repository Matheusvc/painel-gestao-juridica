package com.castroadvocacia.plataforma.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusServico {
    ABERTO("open"),
    EM_ANDAMENTO("progress"),
    CONCLUIDO("done"),
    EM_ANALISE("analise");

    private final String frontendValue;

    StatusServico(String frontendValue) {
        this.frontendValue = frontendValue;
    }

    @JsonValue
    public String getFrontendValue() {
        return frontendValue;
    }

    public static StatusServico fromFrontendValue(String value) {
        for (StatusServico s : values()) {
            if (s.frontendValue.equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Status desconhecido: " + value);
    }
}
