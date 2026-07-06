package io.grundner.d11n.infrastructure.config;

import io.grundner.d11n.domain.user.Role;
import io.grundner.d11n.domain.user.User;
import io.grundner.d11n.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SuperuserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SuperuserProperties superuserProperties;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByEmail(superuserProperties.email()).ifPresentOrElse(
                user -> {
                    if (user.getRole() != Role.ADMIN) {
                        user.setRole(Role.ADMIN);
                        userRepository.save(user);
                        log.info("Superuser '{}' promoted to ADMIN", superuserProperties.email());
                    }
                },
                () -> {
                    User user = new User();
                    user.setEmail(superuserProperties.email());
                    user.setPassword(passwordEncoder.encode(superuserProperties.password()));
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    log.info("Superuser '{}' created", superuserProperties.email());
                }
        );
    }
}
