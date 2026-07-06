package io.grundner.d11n.api.directory;

import io.grundner.d11n.api.content.ContentItemResponse;
import io.grundner.d11n.api.directory.dto.DirectoryRequest;
import io.grundner.d11n.api.directory.dto.DirectoryResponse;
import io.grundner.d11n.application.content.ContentService;
import io.grundner.d11n.application.directory.DirectoryService;
import io.grundner.d11n.domain.directory.Directory;
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

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DirectoryController {

    private final DirectoryService directoryService;
    private final ContentService contentService;

    @PostMapping("/spaces/{spaceId}/directories")
    @ResponseStatus(HttpStatus.CREATED)
    public DirectoryResponse createInSpace(@PathVariable Long spaceId,
                                           @RequestBody @Valid DirectoryRequest request) {
        return DirectoryResponse.from(directoryService.createInSpace(spaceId, request.name()));
    }

    @PostMapping("/directories/{parentId}/directories")
    @ResponseStatus(HttpStatus.CREATED)
    public DirectoryResponse createInDirectory(@PathVariable Long parentId,
                                               @RequestBody @Valid DirectoryRequest request) {
        return DirectoryResponse.from(directoryService.createInDirectory(parentId, request.name()));
    }

    @GetMapping("/directories/{id}")
    public DirectoryResponse get(@PathVariable Long id) {
        return DirectoryResponse.from(directoryService.findById(id));
    }

    @PutMapping("/directories/{id}")
    public DirectoryResponse update(@PathVariable Long id, @RequestBody @Valid DirectoryRequest request) {
        return DirectoryResponse.from(directoryService.update(id, request.name()));
    }

    @DeleteMapping("/directories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        directoryService.delete(id);
    }

    @GetMapping("/directories/{id}/contents")
    public List<ContentItemResponse> contents(@PathVariable Long id) {
        Directory directory = directoryService.findById(id);
        return contentService.listDirectoryContents(directory);
    }
}
