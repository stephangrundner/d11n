package io.grundner.d11n.api.document.dto;

import io.grundner.d11n.api.block.dto.BlockResponse;
import io.grundner.d11n.domain.document.Document;

import java.time.Instant;
import java.util.List;

public record DocumentResponse(Long id, String title, Long spaceId, Long directoryId,
                                List<BlockResponse> blocks,
                                Instant createdAt, Instant updatedAt, String createdBy, String updatedBy) {

    public static DocumentResponse from(Document d) {
        return new DocumentResponse(
                d.getId(),
                d.getTitle(),
                d.getSpace().getId(),
                d.getDirectory() != null ? d.getDirectory().getId() : null,
                d.getBlocks().stream().map(BlockResponse::from).toList(),
                d.getCreatedAt(),
                d.getUpdatedAt(),
                d.getCreatedBy(),
                d.getUpdatedBy()
        );
    }
}
