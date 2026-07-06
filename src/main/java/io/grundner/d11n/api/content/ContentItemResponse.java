package io.grundner.d11n.api.content;

import io.grundner.d11n.domain.directory.Directory;
import io.grundner.d11n.domain.document.Document;

import java.time.Instant;

public record ContentItemResponse(Long id, String type, String name, Instant updatedAt) {

    public static ContentItemResponse fromDirectory(Directory d) {
        return new ContentItemResponse(d.getId(), "DIRECTORY", d.getName(), d.getUpdatedAt());
    }

    public static ContentItemResponse fromDocument(Document d) {
        return new ContentItemResponse(d.getId(), "DOCUMENT", d.getTitle(), d.getUpdatedAt());
    }
}
