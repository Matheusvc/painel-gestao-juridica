package com.castroadvocacia.plataforma.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 60;
    private static final long BLOCK_SECONDS = 900;

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();
    private final Map<String, Instant> blocked = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!"/api/auth/login".equals(request.getServletPath()) || !"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);

        Instant blockedUntil = blocked.get(ip);
        if (blockedUntil != null && Instant.now().isBefore(blockedUntil)) {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Muitas tentativas. Tente novamente em 15 minutos.\"}");
            return;
        }

        if (blockedUntil != null) {
            blocked.remove(ip);
        }

        Deque<Instant> ipAttempts = attempts.computeIfAbsent(ip, k -> new ConcurrentLinkedDeque<>());
        Instant cutoff = Instant.now().minusSeconds(WINDOW_SECONDS);
        while (!ipAttempts.isEmpty() && ipAttempts.peekFirst().isBefore(cutoff)) {
            ipAttempts.pollFirst();
        }

        ipAttempts.addLast(Instant.now());

        if (ipAttempts.size() > MAX_ATTEMPTS) {
            blocked.put(ip, Instant.now().plusSeconds(BLOCK_SECONDS));
            attempts.remove(ip);
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Muitas tentativas. Bloqueado por 15 minutos.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
