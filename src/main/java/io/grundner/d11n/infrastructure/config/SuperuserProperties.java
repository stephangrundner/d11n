package io.grundner.d11n.infrastructure.config;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.superuser")
@Validated
public record SuperuserProperties(
        @Email @NotBlank String email,
        @NotBlank String password
) {
}
