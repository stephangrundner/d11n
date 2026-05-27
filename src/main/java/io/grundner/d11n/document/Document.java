package io.grundner.d11n.document;

import java.time.Instant;
import java.util.List;

public record Document(
        String slug,
        String spaceId,
        String title,
        String content,
        String author,
        List<String> tags,
        Instant createdAt,
        Instant updatedAt
) {}