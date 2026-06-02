package io.grundner.d11n.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;

    @GetMapping
    public List<RoleInfo> list() {
        return roleRepository.findAll().stream()
            .map(RoleInfo::from)
            .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleInfo create(@RequestBody CreateRoleRequest request) {
        String name = request.name().trim().toUpperCase();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role name must not be blank");
        }
        if (!name.matches("[A-Z][A-Z0-9_]*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role name must contain only uppercase letters, digits and underscores");
        }
        if (roleRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Role already exists: " + name);
        }
        Role newRole = new Role();
        newRole.setName(name);
        newRole.setBuiltin(false);
        Role saved = roleRepository.save(newRole);
        return RoleInfo.from(saved);
    }

    @PutMapping("/{id}/permissions")
    public RoleInfo setPermissions(@PathVariable Long id, @RequestBody Set<String> permissions) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
        if (role.isBuiltin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Built-in role permissions cannot be changed");
        }
        role.setPermissions(permissions);
        return RoleInfo.from(roleRepository.save(role));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
        if (role.isBuiltin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Built-in roles cannot be deleted");
        }
        roleRepository.delete(role);
    }

    record CreateRoleRequest(String name) {}
}
