package io.grundner.d11n.share;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShareInfo create(@RequestBody ShareRequest request,
                            @AuthenticationPrincipal UserDetails principal) {
        return ShareInfo.from(shareService.create(request, principal.getUsername()));
    }

    @GetMapping
    public List<ShareInfo> listMyShares(@AuthenticationPrincipal UserDetails principal) {
        return shareService.listByUser(principal.getUsername())
                .stream().map(ShareInfo::from).toList();
    }

    @GetMapping("/for-resource")
    public List<ShareInfo> listForResource(
            @RequestParam String spaceId,
            @RequestParam String resourceType,
            @RequestParam(required = false) String resourcePath,
            @AuthenticationPrincipal UserDetails principal) {
        return shareService.listForResource(spaceId, resourceType, resourcePath)
                .stream()
                .filter(s -> s.getCreatedBy().equals(principal.getUsername()))
                .map(ShareInfo::from)
                .toList();
    }

    @DeleteMapping("/{token}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable String token,
                       @AuthenticationPrincipal UserDetails principal) {
        shareService.revoke(token, principal.getUsername());
    }
}
