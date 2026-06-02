package io.grundner.d11n.document;

import io.grundner.d11n.auth.Permissions;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/spaces/{spaceId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentLockService lockService;

    @GetMapping
    public List<Document> listDocuments(@PathVariable String spaceId) throws IOException, GitAPIException {
        return documentService.listDocuments(spaceId);
    }

    // History and diff use fixed paths so they take precedence over /{*slug}
    @GetMapping("/history")
    public List<CommitInfo> getHistory(@PathVariable String spaceId,
                                       @RequestParam String slug)
            throws IOException, GitAPIException {
        return documentService.getHistory(spaceId, slug);
    }

    @GetMapping("/diff")
    public DiffResponse getDiff(@PathVariable String spaceId,
                                @RequestParam String slug,
                                @RequestParam String hash) throws IOException {
        return documentService.getDiff(spaceId, slug, hash);
    }

    // {*slug} captures path segments including slashes; the value includes a leading /
    @GetMapping("/{*slug}")
    public Document getDocument(@PathVariable String spaceId, @PathVariable String slug)
            throws IOException {
        return documentService.getDocument(spaceId, stripLeadingSlash(slug));
    }

    @PostMapping("/{*slug}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('" + Permissions.DOCUMENT_CREATE + "')")
    public Document createDocument(@PathVariable String spaceId, @PathVariable String slug,
                                   @RequestBody DocumentRequest request,
                                   @AuthenticationPrincipal UserDetails principal) throws IOException, GitAPIException {
        return documentService.createDocument(spaceId, stripLeadingSlash(slug), request, principal.getUsername());
    }

    @PutMapping("/{*slug}")
    @PreAuthorize("hasAuthority('" + Permissions.DOCUMENT_WRITE + "')")
    public Document updateDocument(@PathVariable String spaceId, @PathVariable String slug,
                                   @RequestBody DocumentRequest request,
                                   @AuthenticationPrincipal UserDetails principal) throws IOException, GitAPIException {
        String cleanSlug = stripLeadingSlash(slug);
        if (!lockService.isHeldBy(spaceId, cleanSlug, principal.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You do not hold the edit lock for this document");
        }
        return documentService.updateDocument(spaceId, cleanSlug, request, principal.getUsername());
    }

    @DeleteMapping("/{*slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('" + Permissions.DOCUMENT_DELETE + "')")
    public void deleteDocument(@PathVariable String spaceId, @PathVariable String slug)
            throws IOException, GitAPIException {
        documentService.deleteDocument(spaceId, stripLeadingSlash(slug));
    }

    private static String stripLeadingSlash(String slug) {
        return slug.startsWith("/") ? slug.substring(1) : slug;
    }
}
