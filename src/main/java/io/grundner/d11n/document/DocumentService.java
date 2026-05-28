package io.grundner.d11n.document;

import io.grundner.d11n.config.D11nProperties;
import io.grundner.d11n.git.FrontmatterParser;
import io.grundner.d11n.git.GitRepository;
import io.grundner.d11n.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final SpaceService spaceService;
    private final D11nProperties properties;

    public List<Document> listDocuments(String spaceId) throws IOException, GitAPIException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            List<Document> docs = new ArrayList<>();
            for (String path : repo.listMarkdownFiles()) {
                repo.readFile(path)
                        .map(content -> parseDocument(slugFromPath(path), spaceId, content))
                        .ifPresent(docs::add);
            }
            return docs;
        }
    }

    public Document getDocument(String spaceId, String slug) throws IOException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            return repo.readFile(pathFromSlug(slug))
                    .map(content -> parseDocument(slug, spaceId, content))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found: " + slug));
        }
    }

    public Document createDocument(String spaceId, String slug, DocumentRequest request) throws IOException, GitAPIException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            String filePath = pathFromSlug(slug);
            if (repo.readFile(filePath).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Document already exists: " + slug);
            }
            Instant now = Instant.now();
            String fileContent = buildFileContent(request, now, now);
            repo.writeAndCommit(filePath, fileContent, "docs: create " + slug,
                    resolveAuthor(request.author()), properties.getDefaultEmail());
            return parseDocument(slug, spaceId, fileContent);
        }
    }

    public Document updateDocument(String spaceId, String slug, DocumentRequest request) throws IOException, GitAPIException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            String filePath = pathFromSlug(slug);
            String existing = repo.readFile(filePath)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found: " + slug));

            Instant createdAt = parseInstant(FrontmatterParser.parse(existing).frontmatter().get("createdAt"));
            String fileContent = buildFileContent(request, createdAt, Instant.now());
            repo.writeAndCommit(filePath, fileContent, "docs: update " + slug,
                    resolveAuthor(request.author()), properties.getDefaultEmail());
            return parseDocument(slug, spaceId, fileContent);
        }
    }

    public void deleteDocument(String spaceId, String slug) throws IOException, GitAPIException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            String filePath = pathFromSlug(slug);
            if (repo.readFile(filePath).isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found: " + slug);
            }
            repo.deleteAndCommit(filePath, "docs: delete " + slug,
                    properties.getDefaultAuthor(), properties.getDefaultEmail());
        }
    }

    public List<CommitInfo> getHistory(String spaceId, String slug) throws IOException, GitAPIException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            return repo.getFileHistory(pathFromSlug(slug)).stream()
                    .map(c -> new CommitInfo(
                            c.getName(),
                            c.getShortMessage(),
                            c.getAuthorIdent().getName(),
                            c.getAuthorIdent().getWhenAsInstant()
                    ))
                    .toList();
        }
    }

    public DiffResponse getDiff(String spaceId, String slug, String hash) throws IOException {
        try (GitRepository repo = spaceService.openRepository(spaceId)) {
            return new DiffResponse(repo.getFileDiff(pathFromSlug(slug), hash));
        }
    }

    private Document parseDocument(String slug, String spaceId, String rawContent) {
        var parsed = FrontmatterParser.parse(rawContent);
        var fm = parsed.frontmatter();
        return new Document(
                slug,
                spaceId,
                (String) fm.getOrDefault("title", slug),
                parsed.body(),
                (String) fm.get("author"),
                getFmList(fm, "tags"),
                parseInstant(fm.get("createdAt")),
                parseInstant(fm.get("updatedAt"))
        );
    }

    private String buildFileContent(DocumentRequest request, Instant createdAt, Instant updatedAt) {
        Map<String, Object> fm = new LinkedHashMap<>();
        if (request.title() != null) fm.put("title", request.title());
        if (request.author() != null) fm.put("author", request.author());
        if (request.tags() != null && !request.tags().isEmpty()) fm.put("tags", request.tags());
        fm.put("createdAt", createdAt != null ? createdAt.toString() : Instant.now().toString());
        fm.put("updatedAt", updatedAt.toString());
        return FrontmatterParser.serialize(fm, request.content() != null ? request.content() : "");
    }

    private String resolveAuthor(String requestAuthor) {
        return requestAuthor != null ? requestAuthor : properties.getDefaultAuthor();
    }

    @SuppressWarnings("unchecked")
    private List<String> getFmList(Map<String, Object> fm, String key) {
        Object value = fm.get(key);
        if (value instanceof List<?> list) return (List<String>) list;
        return List.of();
    }

    private Instant parseInstant(Object value) {
        if (value == null) return null;
        try { return Instant.parse(value.toString()); }
        catch (Exception e) { return null; }
    }

    private static String pathFromSlug(String slug) {
        return slug + ".md";
    }

    private static String slugFromPath(String path) {
        return path.replaceAll("\\.md$", "");
    }
}