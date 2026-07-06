package io.grundner.d11n.api.space;

import io.grundner.d11n.api.content.ContentItemResponse;
import io.grundner.d11n.api.space.dto.SpaceRequest;
import io.grundner.d11n.api.space.dto.SpaceResponse;
import io.grundner.d11n.api.space.dto.SpaceSummary;
import io.grundner.d11n.application.content.ContentService;
import io.grundner.d11n.application.space.SpaceService;
import io.grundner.d11n.domain.space.Space;
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
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;
    private final ContentService contentService;

    @GetMapping
    public List<SpaceSummary> list() {
        return spaceService.findAll().stream()
                .map(s -> SpaceSummary.from(s, spaceService.countDocuments(s), spaceService.countDirectories(s)))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpaceResponse create(@RequestBody @Valid SpaceRequest request) {
        return SpaceResponse.from(spaceService.create(request.name()));
    }

    @GetMapping("/{id}")
    public SpaceResponse get(@PathVariable Long id) {
        return SpaceResponse.from(spaceService.findById(id));
    }

    @PutMapping("/{id}")
    public SpaceResponse update(@PathVariable Long id, @RequestBody @Valid SpaceRequest request) {
        return SpaceResponse.from(spaceService.update(id, request.name()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        spaceService.delete(id);
    }

    @GetMapping("/{id}/contents")
    public List<ContentItemResponse> contents(@PathVariable Long id) {
        Space space = spaceService.findById(id);
        return contentService.listSpaceContents(space);
    }
}
