package io.grundner.d11n.document;

import java.util.List;

public record DocumentRequest(
        String title,
        String content,
        String author,
        List<String> tags
) {}