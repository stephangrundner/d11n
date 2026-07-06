package io.grundner.d11n.api.document.dto;

import jakarta.validation.constraints.NotBlank;

public record DocumentRequest(@NotBlank String title) {
}
