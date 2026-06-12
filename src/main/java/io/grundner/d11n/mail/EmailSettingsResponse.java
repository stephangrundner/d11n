package io.grundner.d11n.mail;

public record EmailSettingsResponse(
    boolean enabled,
    String smtpHost,
    int smtpPort,
    String smtpUsername,
    boolean passwordSet,
    String smtpFrom,
    String smtpFromName,
    boolean smtpTls,
    boolean smtpAuth
) {}
