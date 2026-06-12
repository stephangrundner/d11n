package io.grundner.d11n.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings/email")
@RequiredArgsConstructor
public class EmailSettingsController {

    private final EmailSettingsRepository settingsRepository;
    private final EmailService emailService;

    @GetMapping
    public EmailSettingsResponse get() {
        return toResponse(loadOrDefault());
    }

    @PutMapping
    public EmailSettingsResponse update(@RequestBody EmailSettingsRequest req) {
        EmailSettings s = loadOrDefault();
        s.setEnabled(req.enabled());
        s.setSmtpHost(req.smtpHost());
        s.setSmtpPort(req.smtpPort());
        s.setSmtpUsername(req.smtpUsername());
        if (req.smtpPassword() != null && !req.smtpPassword().isBlank()) {
            s.setSmtpPassword(req.smtpPassword());
        }
        s.setSmtpFrom(req.smtpFrom());
        s.setSmtpFromName(req.smtpFromName());
        s.setSmtpTls(req.smtpTls());
        s.setSmtpAuth(req.smtpAuth());
        return toResponse(settingsRepository.save(s));
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTest(@RequestBody TestEmailRequest req) {
        try {
            emailService.sendTest(req.to());
            return ResponseEntity.ok("Test email sent to " + req.to());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send: " + e.getMessage());
        }
    }

    private EmailSettings loadOrDefault() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            EmailSettings s = new EmailSettings();
            s.setId(1L);
            return s;
        });
    }

    private EmailSettingsResponse toResponse(EmailSettings s) {
        return new EmailSettingsResponse(
            s.isEnabled(),
            s.getSmtpHost(),
            s.getSmtpPort(),
            s.getSmtpUsername(),
            s.getSmtpPassword() != null && !s.getSmtpPassword().isBlank(),
            s.getSmtpFrom(),
            s.getSmtpFromName(),
            s.isSmtpTls(),
            s.isSmtpAuth()
        );
    }
}
