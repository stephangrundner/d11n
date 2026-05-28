package io.grundner.d11n.git;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.AbstractTreeIterator;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.eclipse.jgit.treewalk.EmptyTreeIterator;
import org.eclipse.jgit.treewalk.filter.PathFilter;

import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
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

    public String getFileDiff(String filePath, String commitHash) throws IOException {
        var repo = git.getRepository();
        var baos = new ByteArrayOutputStream();
        try (var rw = new RevWalk(repo);
             var reader = repo.newObjectReader();
             var df = new DiffFormatter(baos)) {

            df.setRepository(repo);
            df.setContext(3);

            var commit = rw.parseCommit(repo.resolve(commitHash));

            AbstractTreeIterator oldTree;
            if (commit.getParentCount() > 0) {
                var parent = rw.parseCommit(commit.getParent(0).getId());
                var parser = new CanonicalTreeParser();
                parser.reset(reader, parent.getTree());
                oldTree = parser;
            } else {
                oldTree = new EmptyTreeIterator();
            }

            var newParser = new CanonicalTreeParser();
            newParser.reset(reader, commit.getTree());

            df.setPathFilter(PathFilter.create(filePath));
            df.format(df.scan(oldTree, newParser));
            df.flush();
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    @Override
    public void close() {
        git.close();
    }
}