package io.grundner.d11n.share;

import io.grundner.d11n.asset.AssetService;
import io.grundner.d11n.document.Document;
import io.grundner.d11n.document.DocumentService;
import io.grundner.d11n.document.TreeNode;
import io.grundner.d11n.document.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/shared")
@RequiredArgsConstructor
public class SharedAccessController {

    private final ShareService shareService;
    private final DocumentService documentService;
    private final FolderService folderService;
    private final AssetService assetService;

    /** Resolves a share token — public, no auth required. Returns 410 if expired. */
    @GetMapping("/{token}")
    public ShareInfo resolve(@PathVariable String token) {
        return ShareInfo.from(shareService.resolve(token));
    }

    /** Returns document content for a document share. */
    @GetMapping("/{token}/document")
    public Document getDocument(@PathVariable String token,
                                @AuthenticationPrincipal UserDetails principal) throws IOException {
        Share share = shareService.resolve(token);
        requireAccess(share, principal);
        if (!"document".equals(share.getResourceType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a document share");
        }
        return documentService.getDocument(share.getSpaceId(), share.getResourcePath());
    }

    /** Serves a binary asset (image/SVG) belonging to the shared space — no auth required for EXTERNAL. */
    @GetMapping("/{token}/assets/{filename}")
    public ResponseEntity<byte[]> getAsset(
            @PathVariable String token,
            @PathVariable String filename,
            @AuthenticationPrincipal UserDetails principal) throws IOException {
        Share share = shareService.resolve(token);
        requireAccess(share, principal);
        byte[] data = assetService.getAsset(share.getSpaceId(), filename);
        String ext = filename.contains(".") ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase() : "";
        MediaType mediaType = switch (ext) {
            case "svg" -> MediaType.parseMediaType("image/svg+xml");
            case "png" -> MediaType.IMAGE_PNG;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
        return ResponseEntity.ok().contentType(mediaType).body(data);
    }

    /** Returns the file tree for a space or folder share. */
    @GetMapping("/{token}/tree")
    public List<TreeNode> getTree(@PathVariable String token,
                                  @AuthenticationPrincipal UserDetails principal) throws IOException {
        Share share = shareService.resolve(token);
        requireAccess(share, principal);
        if ("document".equals(share.getResourceType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a space/folder share");
        }
        List<TreeNode> fullTree = folderService.getTree(share.getSpaceId());
        if ("space".equals(share.getResourceType()) || share.getResourcePath() == null) {
            return fullTree;
        }
        // Folder share — return only nodes under the shared path
        return findSubtree(fullTree, share.getResourcePath());
    }

    // -------------------------------------------------------------------------

    private void requireAccess(Share share, UserDetails principal) {
        if (share.getType() == ShareType.INTERNAL && principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required for this share");
        }
    }

    private List<TreeNode> findSubtree(List<TreeNode> nodes, String path) {
        String[] parts = path.split("/", 2);
        for (TreeNode node : nodes) {
            if (node.name().equals(parts[0]) && "folder".equals(node.type())) {
                if (parts.length == 1) return node.children() != null ? node.children() : List.of();
                return findSubtree(node.children() != null ? node.children() : List.of(), parts[1]);
            }
        }
        return List.of();
    }
}
