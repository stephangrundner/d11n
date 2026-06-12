package io.grundner.d11n.mail;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_settings")
@Getter
@Setter
@NoArgsConstructor
public class EmailSettings {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private boolean enabled = false;

    private String smtpHost;

    @Column(nullable = false)
    private int smtpPort = 587;

    private String smtpUsername;
    private String smtpPassword;
    private String smtpFrom;
    private String smtpFromName;

    @Column(nullable = false)
    private boolean smtpTls = true;

    @Column(nullable = false)
    private boolean smtpAuth = true;
}
