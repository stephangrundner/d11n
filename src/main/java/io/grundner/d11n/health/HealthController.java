package io.grundner.d11n.health;

import io.grundner.d11n.config.D11nProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final D11nProperties properties;

    @GetMapping("/api/health")
    public HealthStatus health() {
        D11nProperties.Heartbeat hb = properties.getHeartbeat();
        return new HealthStatus("ok", hb.getIntervalSeconds() * 1000, hb.getTimeoutMs());
    }

    record HealthStatus(String status, int intervalMs, int timeoutMs) {}
}
