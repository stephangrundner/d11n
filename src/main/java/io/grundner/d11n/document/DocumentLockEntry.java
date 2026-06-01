package io.grundner.d11n.document;

import java.time.Duration;
import java.time.Instant;

public record DocumentLockEntry(String username, Instant expiresAt) {

    static final Duration TTL = Duration.ofSeconds(60);

    boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    DocumentLockEntry renewed() {
        return new DocumentLockEntry(username, Instant.now().plus(TTL));
    }

    static DocumentLockEntry forUser(String username) {
        return new DocumentLockEntry(username, Instant.now().plus(TTL));
    }
}
