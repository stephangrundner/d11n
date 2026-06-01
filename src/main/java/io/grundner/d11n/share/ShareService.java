package io.grundner.d11n.share;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareRepository shareRepository;

    public Share create(ShareRequest request, String username) {
        Share share = Share.builder()
                .token(UUID.randomUUID().toString())
                .type(request.type())
                .resourceType(request.resourceType())
                .spaceId(request.spaceId())
                .resourcePath(request.resourcePath())
                .label(request.label())
                .expiresAt(request.expiresAt())
                .createdBy(username)
                .createdAt(LocalDateTime.now())
                .build();
        return shareRepository.save(share);
    }

    public List<Share> listByUser(String username) {
        return shareRepository.findByCreatedByOrderByCreatedAtDesc(username);
    }

    public List<Share> listForResource(String spaceId, String resourceType, String resourcePath) {
        if (resourcePath == null || resourcePath.isBlank()) {
            return shareRepository.findBySpaceIdAndResourceTypeAndResourcePathIsNull(spaceId, resourceType);
        }
        return shareRepository.findBySpaceIdAndResourceTypeAndResourcePath(spaceId, resourceType, resourcePath);
    }

    public void revoke(String token, String username) {
        Share share = shareRepository.findById(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!share.getCreatedBy().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your share");
        }
        shareRepository.delete(share);
    }

    public Share resolve(String token) {
        Share share = shareRepository.findById(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Share not found"));
        if (share.isExpired()) {
            throw new ResponseStatusException(HttpStatus.GONE, "This share link has expired");
        }
        return share;
    }
}
