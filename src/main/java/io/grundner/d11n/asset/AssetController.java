package io.grundner.d11n.asset;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/api/spaces/{spaceId}/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PutMapping(value = "/{filename}", consumes = MediaType.ALL_VALUE)
    public ResponseEntity<Void> uploadAsset(
            @PathVariable String spaceId,
            @PathVariable String filename,
            HttpServletRequest request
    ) throws IOException, GitAPIException {
        byte[] data = request.getInputStream().readAllBytes();
        assetService.saveAsset(spaceId, filename, data);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getAsset(
            @PathVariable String spaceId,
            @PathVariable String filename
    ) throws IOException {
        byte[] data = assetService.getAsset(spaceId, filename);
        MediaType mediaType = filename.endsWith(".svg")
                ? MediaType.parseMediaType("image/svg+xml")
                : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(data);
    }
}
