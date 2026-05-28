package io.grundner.d11n.auth;

public record AuthResponse(String token, String username, String role) {}