CREATE TABLE email_settings (
    id             BIGINT       NOT NULL PRIMARY KEY,
    enabled        BOOLEAN      NOT NULL DEFAULT FALSE,
    smtp_host      VARCHAR(255),
    smtp_port      INTEGER      NOT NULL DEFAULT 587,
    smtp_username  VARCHAR(255),
    smtp_password  VARCHAR(255),
    smtp_from      VARCHAR(255),
    smtp_from_name VARCHAR(255),
    smtp_tls       BOOLEAN      NOT NULL DEFAULT TRUE,
    smtp_auth      BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO email_settings (id, enabled, smtp_port, smtp_tls, smtp_auth)
VALUES (1, FALSE, 587, TRUE, TRUE);
