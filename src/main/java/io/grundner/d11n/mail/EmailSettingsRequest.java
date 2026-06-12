package io.grundner.d11n.mail;

public record EmailSettingsRequest(
    boolean enabled,
    String smtpHost,
    int smtpPort,
    String smtpUsername,
    /** Null or blank = keep existing password. */
    String smtpPassword,
    String smtpFrom,
    String smtpFromName,
    boolean smtpTls,
    boolean smtpAuth
) {}
