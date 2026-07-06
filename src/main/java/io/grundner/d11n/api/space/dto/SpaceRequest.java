package io.grundner.d11n.api.space.dto;

import jakarta.validation.constraints.NotBlank;

public record SpaceRequest(@NotBlank String name) {
}
