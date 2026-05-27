package io.grundner.d11n.space;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @GetMapping
    public List<Space> listSpaces() throws IOException {
        return spaceService.listSpaces();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Space createSpace(@RequestBody CreateSpaceRequest request) throws IOException, GitAPIException {
        return spaceService.createSpace(request.id());
    }

    @GetMapping("/{spaceId}")
    public Space getSpace(@PathVariable String spaceId) throws IOException {
        return spaceService.findById(spaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Space not found: " + spaceId));
    }
}