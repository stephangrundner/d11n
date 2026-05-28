package io.grundner.d11n.asset;

import io.grundner.d11n.config.D11nProperties;
import io.grundner.d11n.git.GitRepository;
import io.grundner.d11n.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final SpaceService spaceService;
    private final D11nProperties properties;

    public void saveAsset(String spaceId, String filename, byte[] data) throws IOException, GitAPIException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            String filePath = "assets/" + filename;
            repo.writeBinaryAndCommit(filePath, data, "assets: update " + filename,
                    properties.getDefaultAuthor(), properties.getDefaultEmail());
        }
    }

    public byte[] getAsset(String spaceId, String filename) throws IOException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            return repo.readBinary("assets/" + filename)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found: " + filename));
        }
    }
}
