package com.castroadvocacia.plataforma.util;

public final class Iniciais {

    private Iniciais() {}

    public static String fromNome(String nome) {
        if (nome == null || nome.isBlank()) return "";
        String[] partes = nome.trim().split("\\s+");
        if (partes.length == 1) {
            return partes[0].substring(0, Math.min(2, partes[0].length())).toUpperCase();
        }
        return (String.valueOf(partes[0].charAt(0)) + partes[partes.length - 1].charAt(0)).toUpperCase();
    }
}
