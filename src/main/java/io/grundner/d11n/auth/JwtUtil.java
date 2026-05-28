package io.grundner.d11n.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${d11n.security.jwt.secret:}")
    private String secretConfig;

    @Value("${d11n.security.jwt.expiration-hours:24}")
    private int expirationHours;

    private SecretKey key;

    @PostConstruct
    void init() {
        key = secretConfig.isBlank()
            ? Jwts.SIG.HS256.key().build()
            : Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretConfig));
    }

    public String generateToken(String username) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date(now))
            .expiration(new Date(now + (long) expirationHours * 3_600_000))
            .signWith(key)
            .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}