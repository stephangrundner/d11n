package io.grundner.d11n.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "d11n")
@Data
public class D11nProperties {

    private String spacesBaseDir = System.getProperty("user.home") + "/d11n-spaces";
    private String defaultAuthor = "d11n";
    private String defaultEmail = "d11n@localhost";

    private Heartbeat heartbeat = new Heartbeat();
    private Superuser superuser = new Superuser();

    @Data
    public static class Heartbeat {
        private int intervalSeconds = 30;
        private int timeoutMs = 5000;
    }

    @Data
    public static class Superuser {
        private String username = "";
        private String email = "";
        // Plain text — BCrypt-encoded on save. Set via env var D11N_SUPERUSER_PASSWORD in prod.
        private String password = "";
    }
}