package io.grundner.d11n.api.directory.dto;

import io.grundner.d11n.domain.directory.Directory;

import java.time.Instant;

public record DirectoryResponse(Long id, String name, Long spaceId, Long parentId,
                                Instant createdAt, Instant updatedAt, String createdBy, String updatedBy) {

    public static DirectoryResponse from(Directory d) {
        return new DirectoryResponse(
                d.getId(),
                d.getName(),
                d.getSpace().getId(),
                d.getParent() != null ? d.getParent().getId() : null,
                d.getCreatedAt(),
                d.getUpdatedAt(),
                d.getCreatedBy(),
                d.getUpdatedBy()
        );
    }
}
