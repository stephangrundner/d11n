package io.grundner.d11n.share;

import java.time.LocalDateTime;

public record ShareInfo(
        String token,
        ShareType type,
        String resourceType,
        String spaceId,
        String resourcePath,
        String label,
        LocalDateTime expiresAt,
        String createdBy,
        LocalDateTime createdAt,
        boolean expired
) {
    public static ShareInfo from(Share share) {
        return new ShareInfo(
                share.getToken(),
                share.getType(),
                share.getResourceType(),
                share.getSpaceId(),
                share.getResourcePath(),
                share.getLabel(),
                share.getExpiresAt(),
                share.getCreatedBy(),
                share.getCreatedAt(),
                share.isExpired()
        );
    }
}
