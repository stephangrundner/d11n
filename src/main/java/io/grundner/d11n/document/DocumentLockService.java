package io.grundner.d11n.document;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DocumentLockService {

    private final ConcurrentHashMap<String, DocumentLockEntry> locks = new ConcurrentHashMap<>();

    private static String key(String spaceId, String slug) {
        return spaceId + ":" + slug;
    }

    /**
     * Acquires the lock for {@code username}. Succeeds if the lock is free, expired,
     * or already held by the same user (idempotent re-acquire).
     *
     * @return true if the lock is now held by username, false if held by someone else
     */
    public boolean acquire(String spaceId, String slug, String username) {
        var entry = locks.compute(key(spaceId, slug), (k, existing) -> {
            if (existing == null || existing.isExpired() || existing.username().equals(username))
                return DocumentLockEntry.forUser(username);
            return existing;
        });
        return entry.username().equals(username);
    }

    /**
     * Renews the TTL of a lock already held by {@code username}.
     *
     * @return true if the heartbeat was accepted, false if the user no longer holds the lock
     */
    public boolean heartbeat(String spaceId, String slug, String username) {
        var entry = locks.computeIfPresent(key(spaceId, slug), (k, existing) ->
            existing.username().equals(username) ? existing.renewed() : existing
        );
        return entry != null && entry.username().equals(username);
    }

    public void release(String spaceId, String slug, String username) {
        locks.computeIfPresent(key(spaceId, slug), (k, v) ->
            v.username().equals(username) ? null : v
        );
    }

    public Optional<DocumentLockEntry> status(String spaceId, String slug) {
        return Optional.ofNullable(locks.get(key(spaceId, slug))).filter(e -> !e.isExpired());
    }

    public boolean isHeldBy(String spaceId, String slug, String username) {
        return status(spaceId, slug).map(e -> e.username().equals(username)).orElse(false);
    }

    @Scheduled(fixedDelay = 10_000)
    public void evictExpired() {
        locks.entrySet().removeIf(e -> e.getValue().isExpired());
    }
}
