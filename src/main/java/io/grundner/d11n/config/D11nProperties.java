package io.grundner.d11n.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "d11n")
@Data
public class D11nProperties {

    private String spacesBaseDir = System.getProperty("user.home") + "/d11n-spaces";
    private String defaultAuthor = "d11n";
    private String defaultEmail = "d11n@localhost";
}