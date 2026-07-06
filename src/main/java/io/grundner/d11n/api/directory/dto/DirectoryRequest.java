package io.grundner.d11n.api.directory.dto;

import jakarta.validation.constraints.NotBlank;

public record DirectoryRequest(@NotBlank String name) {
}
