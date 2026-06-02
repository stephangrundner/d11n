package io.grundner.d11n.auth;

import java.util.List;

public record AuthResponse(String token, String username, List<String> roles) {}
