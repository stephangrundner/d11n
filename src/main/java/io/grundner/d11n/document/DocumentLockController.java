package io.grundner.d11n.document;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spaces/{spaceId}/document-locks")
@RequiredArgsConstructor
public class DocumentLockController {

    private final DocumentLockService lockService;

    @PostMapping
    public ResponseEntity<DocumentLockStatus> acquire(
            @PathVariable String spaceId,
            @RequestParam String slug,
            @AuthenticationPrincipal UserDetails principal) {
        boolean acquired = lockService.acquire(spaceId, slug, principal.getUsername());
        if (acquired) {
            return ResponseEntity.ok(DocumentLockStatus.heldBy(principal.getUsername()));
        }
        var current = lockService.status(spaceId, slug);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(current.map(e -> DocumentLockStatus.heldBy(e.username()))
                             .orElse(DocumentLockStatus.free()));
    }

    /** Heartbeat — renews the TTL. Returns 204 on success, 409 if lock is no longer held. */
    @PutMapping
    public ResponseEntity<Void> heartbeat(
            @PathVariable String spaceId,
            @RequestParam String slug,
            @AuthenticationPrincipal UserDetails principal) {
        return lockService.heartbeat(spaceId, slug, principal.getUsername())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void release(
            @PathVariable String spaceId,
            @RequestParam String slug,
            @AuthenticationPrincipal UserDetails principal) {
        lockService.release(spaceId, slug, principal.getUsername());
    }

    @GetMapping
    public DocumentLockStatus status(
            @PathVariable String spaceId,
            @RequestParam String slug) {
        return lockService.status(spaceId, slug)
                .map(e -> DocumentLockStatus.heldBy(e.username()))
                .orElse(DocumentLockStatus.free());
    }
}
