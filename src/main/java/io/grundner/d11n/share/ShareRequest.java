package io.grundner.d11n.share;

import java.time.LocalDateTime;

public record ShareRequest(
        ShareType type,
        String resourceType,
        String spaceId,
        String resourcePath,
        String label,
        LocalDateTime expiresAt
) {}
