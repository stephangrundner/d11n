package io.grundner.d11n.space;

import io.grundner.d11n.config.D11nProperties;
import io.grundner.d11n.git.GitRepository;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final D11nProperties properties;

    public List<Space> listSpaces() throws IOException {
        Path baseDir = Path.of(properties.getSpacesBaseDir());
        if (!Files.isDirectory(baseDir)) return List.of();
        try (var stream = Files.list(baseDir)) {
            return stream
                    .filter(p -> Files.isDirectory(p.resolve(".git")))
                    .map(p -> new Space(p.getFileName().toString(), p.getFileName().toString(), p))
                    .sorted(Comparator.comparing(Space::getId))
                    .toList();
        }
    }

    public Optional<Space> findById(String id) throws IOException {
        return listSpaces().stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
    }

    public Space createSpace(String id) throws IOException, GitAPIException {
        if (id == null || !id.matches("[a-zA-Z0-9][a-zA-Z0-9_-]*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid space ID. Use letters, numbers, hyphens or underscores (must start with a letter or digit).");
        }
        Path repoPath = Path.of(properties.getSpacesBaseDir()).resolve(id);
        if (Files.exists(repoPath)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Space already exists: " + id);
        }
        Files.createDirectories(repoPath);
        try (Git git = Git.init().setDirectory(repoPath.toFile()).call()) {
            // repo initialized
        }
        return new Space(id, id, repoPath);
    }

    public int countDocuments(String spaceId) throws IOException {
        Path repoPath = Path.of(properties.getSpacesBaseDir()).resolve(spaceId);
        if (!Files.isDirectory(repoPath)) return 0;
        try (var stream = Files.walk(repoPath)) {
            return (int) stream
                    .filter(p -> !p.startsWith(repoPath.resolve(".git")))
                    .filter(p -> p.toString().endsWith(".md"))
                    .count();
        }
    }

    public void deleteSpace(String id) throws IOException {
        Path repoPath = Path.of(properties.getSpacesBaseDir()).resolve(id);
        if (!Files.exists(repoPath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Space not found: " + id);
        }
        try (var stream = Files.walk(repoPath)) {
            stream.sorted(Comparator.reverseOrder()).forEach(p -> {
                try { Files.delete(p); } catch (IOException e) { throw new UncheckedIOException(e); }
            });
        }
    }

    public GitRepository openRepository(String spaceId) throws IOException {
        return findById(spaceId)
                .map(s -> {
                    try { return GitRepository.open(s.getRepoPath()); }
                    catch (IOException e) { throw new UncheckedIOException(e); }
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Space not found: " + spaceId));
    }
}