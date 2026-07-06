package io.grundner.d11n.api.space.dto;

import io.grundner.d11n.domain.space.Space;

import java.time.Instant;

public record SpaceResponse(Long id, String name, Instant createdAt, Instant updatedAt,
                            String createdBy, String updatedBy) {

    public static SpaceResponse from(Space s) {
        return new SpaceResponse(s.getId(), s.getName(), s.getCreatedAt(), s.getUpdatedAt(),
                s.getCreatedBy(), s.getUpdatedBy());
    }
}
