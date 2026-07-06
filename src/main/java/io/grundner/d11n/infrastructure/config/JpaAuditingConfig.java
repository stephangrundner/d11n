package io.grundner.d11n.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Enables Spring Data JPA auditing so {@code BaseEntity}'s created/last-modified
 * by+at fields are filled automatically. The auditor is the e-mail of the
 * currently authenticated user, read straight from the security principal — NO
 * database query, so auditing never triggers a re-entrant flush. When there is
 * no authenticated user (startup, superuser bootstrap, self-registration), the
 * auditor is empty and the created_by/updated_by columns stay null.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.empty();
            }
            return Optional.ofNullable(auth.getName());
        };
    }
}
