package io.grundner.d11n.document;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/spaces/{spaceId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public List<Document> listDocuments(@PathVariable String spaceId) throws IOException, GitAPIException {
        return documentService.listDocuments(spaceId);
    }

    @GetMapping("/{slug}")
    public Document getDocument(@PathVariable String spaceId, @PathVariable String slug)
            throws IOException {
        return documentService.getDocument(spaceId, slug);
    }

    @PostMapping("/{slug}")
    @ResponseStatus(HttpStatus.CREATED)
    public Document createDocument(@PathVariable String spaceId, @PathVariable String slug,
                                   @RequestBody DocumentRequest request,
                                   @AuthenticationPrincipal UserDetails principal) throws IOException, GitAPIException {
        return documentService.createDocument(spaceId, slug, request, principal.getUsername());
    }

    @PutMapping("/{slug}")
    public Document updateDocument(@PathVariable String spaceId, @PathVariable String slug,
                                   @RequestBody DocumentRequest request,
                                   @AuthenticationPrincipal UserDetails principal) throws IOException, GitAPIException {
        return documentService.updateDocument(spaceId, slug, request, principal.getUsername());
    }

    @DeleteMapping("/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable String spaceId, @PathVariable String slug)
            throws IOException, GitAPIException {
        documentService.deleteDocument(spaceId, slug);
    }

    @GetMapping("/{slug}/history")
    public List<CommitInfo> getHistory(@PathVariable String spaceId, @PathVariable String slug)
            throws IOException, GitAPIException {
        return documentService.getHistory(spaceId, slug);
    }

    @GetMapping("/{slug}/history/{hash}/diff")
    public DiffResponse getDiff(@PathVariable String spaceId, @PathVariable String slug,
                                @PathVariable String hash) throws IOException {
        return documentService.getDiff(spaceId, slug, hash);
    }
}