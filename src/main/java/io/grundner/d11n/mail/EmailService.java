package io.grundner.d11n.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailSettingsRepository settingsRepository;
    private final ResourceLoader resourceLoader;

    /**
     * Sends an HTML email using a template from {@code classpath:templates/email/<name>.html}.
     * Variables in the template are replaced using {@code {{key}}} syntax.
     */
    public void send(String to, String subject, String templateName, Map<String, String> variables)
            throws MessagingException, IOException {

        EmailSettings settings = loadEnabledSettings();
        JavaMailSenderImpl sender = buildSender(settings);

        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setFrom(fromAddress(settings));
        helper.setText(renderTemplate(templateName, variables), true);

        sender.send(message);
    }

    public void sendTest(String to) throws MessagingException, IOException {
        send(to, "d11n — Test Email", "test", Map.of(
            "recipientEmail", to,
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    private EmailSettings loadEnabledSettings() {
        EmailSettings settings = settingsRepository.findById(1L)
            .orElseThrow(() -> new IllegalStateException("Email settings not found."));
        if (!settings.isEnabled()) {
            throw new IllegalStateException("Email is disabled. Enable it in Settings → Email.");
        }
        return settings;
    }

    private JavaMailSenderImpl buildSender(EmailSettings s) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(s.getSmtpHost());
        sender.setPort(s.getSmtpPort());
        if (s.isSmtpAuth()) {
            sender.setUsername(s.getSmtpUsername());
            sender.setPassword(s.getSmtpPassword());
        }
        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(s.isSmtpAuth()));
        props.put("mail.smtp.starttls.enable", String.valueOf(s.isSmtpTls()));
        return sender;
    }

    private InternetAddress fromAddress(EmailSettings s) throws UnsupportedEncodingException {
        String name = s.getSmtpFromName() != null ? s.getSmtpFromName() : "d11n";
        return new InternetAddress(s.getSmtpFrom(), name, "UTF-8");
    }

    private String renderTemplate(String name, Map<String, String> variables) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:templates/email/" + name + ".html");
        String html = resource.getContentAsString(StandardCharsets.UTF_8);
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return html;
    }
}
