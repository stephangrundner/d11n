package io.grundner.d11n.git;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.revwalk.RevCommit;

import java.io.Closeable;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class GitRepository implements Closeable {

    private final Git git;
    private final Path workTree;

    private GitRepository(Git git) {
        this.git = git;
        this.workTree = git.getRepository().getWorkTree().toPath();
    }

    public static GitRepository open(Path repoPath) throws IOException {
        return new GitRepository(Git.open(repoPath.toFile()));
    }

    public void writeAndCommit(String filePath, String content, String message, String authorName, String authorEmail)
            throws IOException, GitAPIException {
        Path target = workTree.resolve(filePath);
        Files.createDirectories(target.getParent());
        Files.writeString(target, content);
        git.add().addFilepattern(filePath).call();
        git.commit()
                .setMessage(message)
                .setAuthor(authorName, authorEmail)
                .call();
    }

    public void deleteAndCommit(String filePath, String message, String authorName, String authorEmail)
            throws GitAPIException {
        git.rm().addFilepattern(filePath).call();
        git.commit()
                .setMessage(message)
                .setAuthor(authorName, authorEmail)
                .call();
    }

    public void writeBinaryAndCommit(String filePath, byte[] content, String message, String authorName, String authorEmail)
            throws IOException, GitAPIException {
        Path target = workTree.resolve(filePath);
        Files.createDirectories(target.getParent());
        Files.write(target, content);
        git.add().addFilepattern(filePath).call();
        git.commit()
                .setMessage(message)
                .setAuthor(authorName, authorEmail)
                .call();
    }

    public Optional<String> readFile(String filePath) throws IOException {
        Path target = workTree.resolve(filePath);
        if (!Files.exists(target)) return Optional.empty();
        return Optional.of(Files.readString(target));
    }

    public Optional<byte[]> readBinary(String filePath) throws IOException {
        Path target = workTree.resolve(filePath);
        if (!Files.exists(target)) return Optional.empty();
        return Optional.of(Files.readAllBytes(target));
    }

    public List<String> listMarkdownFiles() throws IOException {
        try (var stream = Files.walk(workTree)) {
            return stream
                    .filter(p -> !p.startsWith(workTree.resolve(".git")))
                    .filter(p -> p.toString().endsWith(".md"))
                    .map(workTree::relativize)
                    .map(Path::toString)
                    .sorted()
                    .toList();
        }
    }

    public List<RevCommit> getFileHistory(String filePath) throws GitAPIException {
        List<RevCommit> commits = new ArrayList<>();
        git.log().addPath(filePath).call().forEach(commits::add);
        return commits;
    }

    @Override
    public void close() {
        git.close();
    }
}