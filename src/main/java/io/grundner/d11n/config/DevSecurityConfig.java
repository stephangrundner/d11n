package io.grundner.d11n.config;

import io.grundner.d11n.auth.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
@Profile("dev")
public class DevSecurityConfig {

    @Value("${d11n.dev.test-user.username:admin}")
    private String username;

    @Value("${d11n.dev.test-user.email:admin@localhost}")
    private String email;

    @Value("${d11n.dev.test-user.password:admin}")
    private String password;

    @Bean
    public CommandLineRunner devUserSeeder(AuthService authService) {
        return args -> {
            authService.ensureUser(username, email, password);
            log.info("Dev user ready — username: {}", username);
        };
    }
}