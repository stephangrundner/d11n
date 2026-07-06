package io.grundner.d11n;

import io.grundner.d11n.infrastructure.config.SuperuserProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SuperuserProperties.class)
public class D11nApplication {

    public static void main(String[] args) {
        SpringApplication.run(D11nApplication.class, args);
    }
}
