package io.grundner.d11n.share;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shares")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Share {

    @Id
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareType type;

    /** "space" | "folder" | "document" */
    @Column(nullable = false)
    private String resourceType;

    @Column(nullable = false)
    private String spaceId;

    /** null for space shares, folder path or document slug otherwise. */
    private String resourcePath;

    /** Optional human-readable description set by the creator. */
    private String label;

    /** null = permanent. */
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
