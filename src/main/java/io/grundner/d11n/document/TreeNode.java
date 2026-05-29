package io.grundner.d11n.document;

import java.util.List;

public record TreeNode(
        String name,
        String path,
        String type,   // "document" or "folder"
        String title,
        List<TreeNode> children
) {
    public static TreeNode document(String name, String path, String title) {
        return new TreeNode(name, path, "document", title, null);
    }

    public static TreeNode folder(String name, String path, List<TreeNode> children) {
        return new TreeNode(name, path, "folder", null, children);
    }
}
