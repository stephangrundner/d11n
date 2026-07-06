package io.grundner.d11n.api.auth.dto;

public record TokenResponse(String token, String type) {

    public static TokenResponse bearer(String token) {
        return new TokenResponse(token, "Bearer");
    }
}
