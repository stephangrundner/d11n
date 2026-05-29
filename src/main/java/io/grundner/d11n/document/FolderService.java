package io.grundner.d11n.document;

import io.grundner.d11n.config.D11nProperties;
import io.grundner.d11n.git.FrontmatterParser;
import io.grundner.d11n.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final SpaceService spaceService;
    private final D11nProperties properties;

    public List<TreeNode> getTree(String spaceId) throws IOException {
        try (var repo = spaceService.openRepository(spaceId)) {
            List<String> files = repo.listMarkdownFiles();
            List<String> folders = repo.listFolderPaths();
            return buildTree(files, folders, repo);
        }
    }

    public void createFolder(String spaceId, String path, String currentUser)
            throws IOException, GitAPIException {
        try (var repo = spaceService.openRepository(spaceId)) {
            repo.createFolderAndCommit(
                    path, currentUser, properties.getDefaultEmail());
        }
    }

    public void deleteFolder(String spaceId, String path, String currentUser)
            throws IOException, GitAPIException {
        try (var repo = spaceService.openRepository(spaceId)) {
            repo.deleteFolderAndCommit(
                    path, currentUser, properties.getDefaultEmail());
        }
    }

    public void renameFolder(String spaceId, String oldPath, String newPath, String currentUser)
            throws IOException, GitAPIException {
        try (var repo = spaceService.openRepository(spaceId)) {
            repo.renameFolderAndCommit(
                    oldPath, newPath, currentUser, properties.getDefaultEmail());
        }
    }

    // -------------------------------------------------------------------------

    private List<TreeNode> buildTree(List<String> filePaths, List<String> folderPaths, io.grundner.d11n.git.GitRepository repo)
            throws IOException {
        Map<String, Object> root = new TreeMap<>();
        // Insert explicitly created folders (from .gitkeep)
        for (String folderPath : folderPaths) {
            String[] parts = folderPath.split("/");
            ensureFolderInMap(root, parts, 0);
        }
        // Insert documents
        for (String filePath : filePaths) {
            String slug = filePath.endsWith(".md") ? filePath.substring(0, filePath.length() - 3) : filePath;
            String[] parts = slug.replace("\\", "/").split("/");
            insertIntoMap(root, parts, 0, slug, filePath, repo);
        }
        return toTreeNodes(root, "");
    }

    @SuppressWarnings("unchecked")
    private void insertIntoMap(Map<String, Object> node, String[] parts, int depth,
                               String slug, String filePath, io.grundner.d11n.git.GitRepository repo)
            throws IOException {
        String segment = parts[depth];
        if (depth == parts.length - 1) {
            String title = slug;
            try {
                var raw = repo.readFile(filePath);
                if (raw.isPresent()) {
                    var parsed = FrontmatterParser.parse(raw.get());
                    Object t = parsed.frontmatter().get("title");
                    if (t != null) title = t.toString();
                }
            } catch (Exception ignored) {}
            node.put(segment, Map.of("__slug__", slug, "__title__", title));
        } else {
            node.computeIfAbsent(segment, k -> new TreeMap<String, Object>());
            insertIntoMap((Map<String, Object>) node.get(segment), parts, depth + 1, slug, filePath, repo);
        }
    }

    @SuppressWarnings("unchecked")
    private void ensureFolderInMap(Map<String, Object> node, String[] parts, int depth) {
        String segment = parts[depth];
        if (!node.containsKey(segment)) {
            node.put(segment, new TreeMap<String, Object>());
        }
        if (depth < parts.length - 1) {
            Object child = node.get(segment);
            if (child instanceof Map) {
                ensureFolderInMap((Map<String, Object>) child, parts, depth + 1);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private List<TreeNode> toTreeNodes(Map<String, Object> node, String parentPath) {
        List<TreeNode> folders = new ArrayList<>();
        List<TreeNode> documents = new ArrayList<>();

        for (var entry : node.entrySet()) {
            String name = entry.getKey();
            Object value = entry.getValue();
            String currentPath = parentPath.isEmpty() ? name : parentPath + "/" + name;

            if (value instanceof Map<?, ?> map) {
                if (map.containsKey("__slug__")) {
                    // document leaf
                    documents.add(TreeNode.document(name, (String) map.get("__slug__"), (String) map.get("__title__")));
                } else {
                    // folder
                    List<TreeNode> children = toTreeNodes((Map<String, Object>) value, currentPath);
                    folders.add(TreeNode.folder(name, currentPath, children));
                }
            }
        }

        // folders first, then documents, both sorted alphabetically
        folders.sort(Comparator.comparing(TreeNode::name));
        documents.sort(Comparator.comparing(TreeNode::name));
        List<TreeNode> result = new ArrayList<>(folders);
        result.addAll(documents);
        return result;
    }
}
