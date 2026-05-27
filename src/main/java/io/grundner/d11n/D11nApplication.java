package io.grundner.d11n;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class D11nApplication {

    public static void main(String[] args) {
        SpringApplication.run(D11nApplication.class, args);
    }

}
