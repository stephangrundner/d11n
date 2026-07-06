package io.grundner.d11n.api.document;

import io.grundner.d11n.api.document.dto.DocumentRequest;
import io.grundner.d11n.api.document.dto.DocumentResponse;
import io.grundner.d11n.application.document.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/spaces/{spaceId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse createInSpace(@PathVariable Long spaceId,
                                          @RequestBody @Valid DocumentRequest request) {
        return DocumentResponse.from(documentService.createInSpace(spaceId, request.title()));
    }

    @PostMapping("/directories/{directoryId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse createInDirectory(@PathVariable Long directoryId,
                                              @RequestBody @Valid DocumentRequest request) {
        return DocumentResponse.from(documentService.createInDirectory(directoryId, request.title()));
    }

    @GetMapping("/documents/{id}")
    public DocumentResponse get(@PathVariable Long id) {
        return DocumentResponse.from(documentService.findById(id));
    }

    @PutMapping("/documents/{id}")
    public DocumentResponse update(@PathVariable Long id, @RequestBody @Valid DocumentRequest request) {
        return DocumentResponse.from(documentService.update(id, request.title()));
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentService.delete(id);
    }
}
