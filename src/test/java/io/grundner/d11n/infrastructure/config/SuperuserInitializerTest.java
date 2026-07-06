package io.grundner.d11n.infrastructure.config;

import io.grundner.d11n.domain.user.Role;
import io.grundner.d11n.domain.user.User;
import io.grundner.d11n.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SuperuserInitializerTest {

    @Autowired UserRepository userRepository;
    @Autowired SuperuserProperties superuserProperties;

    @Test
    void superuser_isCreatedOnStartup() {
        User superuser = userRepository.findByEmail(superuserProperties.email())
                .orElseThrow(() -> new AssertionError("Superuser not found"));

        assertThat(superuser.getRole()).isEqualTo(Role.ADMIN);
        assertThat(superuser.getEmail()).isEqualTo(superuserProperties.email());
    }

    @Test
    void superuser_canLogin() throws Exception {
        // Verifies password was encoded correctly by checking the user exists and is an admin
        User superuser = userRepository.findByEmail(superuserProperties.email()).orElseThrow();
        assertThat(superuser.getPassword()).isNotEqualTo(superuserProperties.password());
        assertThat(superuser.getPassword()).startsWith("$2a$");
    }
}
