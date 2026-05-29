package io.grundner.d11n.git;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.AbstractTreeIterator;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.eclipse.jgit.treewalk.EmptyTreeIterator;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;

import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.IOException;
import java.io.OutputStream;
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

    public List<String> listFolderPaths() throws IOException {
        try (var stream = Files.walk(workTree)) {
            return stream
                    .filter(p -> !p.startsWith(workTree.resolve(".git")))
                    .filter(p -> p.getFileName() != null && p.getFileName().toString().equals(".gitkeep"))
                    .map(p -> workTree.relativize(p.getParent()).toString().replace("\\", "/"))
                    .filter(s -> !s.isEmpty())
                    .sorted()
                    .toList();
        }
    }

    public void createFolderAndCommit(String folderPath, String authorName, String authorEmail)
            throws IOException, GitAPIException {
        Path dir = workTree.resolve(folderPath);
        Files.createDirectories(dir);
        String keepFile = folderPath + "/.gitkeep";
        Files.createFile(workTree.resolve(keepFile));
        git.add().addFilepattern(keepFile).call();
        git.commit()
                .setMessage("folders: create " + folderPath)
                .setAuthor(authorName, authorEmail)
                .call();
    }

    public void deleteFolderAndCommit(String folderPath, String authorName, String authorEmail)
            throws IOException, GitAPIException {
        Path dir = workTree.resolve(folderPath);
        if (!Files.isDirectory(dir)) return;
        // stage all deletions
        try (var stream = Files.walk(dir)) {
            stream.filter(Files::isRegularFile).forEach(p -> {
                String rel = workTree.relativize(p).toString().replace("\\", "/");
                try { git.rm().addFilepattern(rel).call(); }
                catch (GitAPIException e) { throw new RuntimeException(e); }
            });
        }
        git.commit()
                .setMessage("folders: delete " + folderPath)
                .setAuthor(authorName, authorEmail)
                .call();
    }

    public void renameFolderAndCommit(String oldPath, String newPath, String authorName, String authorEmail)
            throws IOException, GitAPIException {
        Path oldDir = workTree.resolve(oldPath);
        Path newDir = workTree.resolve(newPath);
        if (!Files.isDirectory(oldDir)) return;
        Files.createDirectories(newDir.getParent());
        // move files one by one so git tracks them
        try (var stream = Files.walk(oldDir)) {
            List<Path> files = stream.filter(Files::isRegularFile).toList();
            for (Path src : files) {
                String relOld = workTree.relativize(src).toString().replace("\\", "/");
                String relNew = newPath + relOld.substring(oldPath.length());
                Path dst = workTree.resolve(relNew);
                Files.createDirectories(dst.getParent());
                Files.move(src, dst);
                git.rm().addFilepattern(relOld).call();
                git.add().addFilepattern(relNew).call();
            }
        }
        git.commit()
                .setMessage("folders: rename " + oldPath + " → " + newPath)
                .setAuthor(authorName, authorEmail)
                .call();
    }

    public List<RevCommit> getFileHistory(String filePath) throws GitAPIException {
        List<RevCommit> commits = new ArrayList<>();
        git.log().addPath(filePath).call().forEach(commits::add);
        return commits;
    }

    public record ChangeStats(int linesAdded, int linesRemoved, int baseLines) {}

    public ChangeStats computeChangeStats(String filePath, String commitHash) throws IOException {
        var repo = git.getRepository();
        try (var rw = new RevWalk(repo);
             var reader = repo.newObjectReader()) {

            var commit = rw.parseCommit(repo.resolve(commitHash));

            int baseLines = 0;
            AbstractTreeIterator oldTree;

            if (commit.getParentCount() > 0) {
                var parent = rw.parseCommit(commit.getParent(0).getId());

                // count lines in the old file version
                try (var tw = new TreeWalk(repo)) {
                    tw.addTree(parent.getTree());
                    tw.setRecursive(true);
                    tw.setFilter(PathFilter.create(filePath));
                    if (tw.next()) {
                        var bytes = repo.open(tw.getObjectId(0)).getBytes();
                        for (byte b : bytes) { if (b == '\n') baseLines++; }
                        if (bytes.length > 0) baseLines++;
                    }
                }

                var parser = new CanonicalTreeParser();
                parser.reset(reader, parent.getTree());
                oldTree = parser;
            } else {
                oldTree = new EmptyTreeIterator();
            }

            var newParser = new CanonicalTreeParser();
            newParser.reset(reader, commit.getTree());

            int added = 0, removed = 0;
            try (var df = new DiffFormatter(OutputStream.nullOutputStream())) {
                df.setRepository(repo);
                df.setPathFilter(PathFilter.create(filePath));
                var diffs = df.scan(oldTree, newParser);
                for (var diff : diffs) {
                    for (var edit : df.toFileHeader(diff).toEditList()) {
                        added += edit.getLengthB();
                        removed += edit.getLengthA();
                    }
                }
            }

            return new ChangeStats(added, removed, baseLines);
        }
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