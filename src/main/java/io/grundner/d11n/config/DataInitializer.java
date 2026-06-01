package io.grundner.d11n.config;

import io.grundner.d11n.auth.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final AuthService authService;
    private final D11nProperties properties;

    @Override
    public void run(ApplicationArguments args) {
        D11nProperties.Superuser su = properties.getSuperuser();
        if (su.getUsername().isBlank() || su.getPassword().isBlank()) {
            return;
        }
        authService.syncSuperuser(su.getUsername(), su.getEmail(), su.getPassword());
        log.info("Superuser '{}' synced from configuration.", su.getUsername());
    }
}
