package io.grundner.d11n.document;

import io.grundner.d11n.auth.Permissions;
import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/spaces/{spaceId}")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @GetMapping("/tree")
    public List<TreeNode> getTree(@PathVariable String spaceId) throws IOException {
        return folderService.getTree(spaceId);
    }

    @PostMapping("/folders")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('" + Permissions.FOLDER_WRITE + "')")
    public void createFolder(@PathVariable String spaceId,
                             @RequestBody FolderRequest request,
                             @AuthenticationPrincipal UserDetails principal)
            throws IOException, GitAPIException {
        folderService.createFolder(spaceId, request.path(), principal.getUsername());
    }

    @DeleteMapping("/folders")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('" + Permissions.FOLDER_DELETE + "')")
    public void deleteFolder(@PathVariable String spaceId,
                             @RequestParam String path,
                             @AuthenticationPrincipal UserDetails principal)
            throws IOException, GitAPIException {
        folderService.deleteFolder(spaceId, path, principal.getUsername());
    }

    @PatchMapping("/folders")
    @PreAuthorize("hasAuthority('" + Permissions.FOLDER_WRITE + "')")
    public void renameFolder(@PathVariable String spaceId,
                             @RequestParam String path,
                             @RequestBody FolderRenameRequest request,
                             @AuthenticationPrincipal UserDetails principal)
            throws IOException, GitAPIException {
        String parent = path.contains("/") ? path.substring(0, path.lastIndexOf('/') + 1) : "";
        String newPath = parent + request.newName();
        folderService.renameFolder(spaceId, path, newPath, principal.getUsername());
    }

    public record FolderRequest(String path) {}
    public record FolderRenameRequest(String newName) {}
}
