package io.grundner.d11n.api.space.dto;

import io.grundner.d11n.domain.space.Space;

import java.time.Instant;

public record SpaceSummary(Long id, String name, long documentCount, long directoryCount, Instant updatedAt) {

    public static SpaceSummary from(Space s, long documentCount, long directoryCount) {
        return new SpaceSummary(s.getId(), s.getName(), documentCount, directoryCount, s.getUpdatedAt());
    }
}
