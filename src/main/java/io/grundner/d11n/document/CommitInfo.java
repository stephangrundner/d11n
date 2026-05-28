package io.grundner.d11n.document;

import java.time.Instant;

public record CommitInfo(
        String hash,
        String message,
        String author,
        Instant timestamp,
        int linesAdded,
        int linesRemoved,
        int baseLines
) {}