package io.grundner.d11n.config;

import io.grundner.d11n.auth.AuthService;
import io.grundner.d11n.auth.Permissions;
import io.grundner.d11n.auth.Role;
import io.grundner.d11n.auth.RoleRepository;
import io.grundner.d11n.auth.Roles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final AuthService authService;
    private final D11nProperties properties;

    private static final Set<String> USER_PERMISSIONS = Set.of(
        Permissions.SPACE_CREATE, Permissions.SPACE_WRITE, Permissions.SPACE_DELETE,
        Permissions.DOCUMENT_CREATE, Permissions.DOCUMENT_WRITE, Permissions.DOCUMENT_DELETE,
        Permissions.FOLDER_WRITE, Permissions.FOLDER_DELETE,
        Permissions.SHARE_CREATE, Permissions.SHARE_REVOKE
    );

    private static final Set<String> ADMIN_PERMISSIONS = Set.of(
        Permissions.SPACE_CREATE, Permissions.SPACE_WRITE, Permissions.SPACE_DELETE,
        Permissions.DOCUMENT_CREATE, Permissions.DOCUMENT_WRITE, Permissions.DOCUMENT_DELETE,
        Permissions.FOLDER_WRITE, Permissions.FOLDER_DELETE,
        Permissions.SHARE_CREATE, Permissions.SHARE_REVOKE,
        Permissions.ADMIN_ROLES, Permissions.ADMIN_USERS
    );

    @Override
    public void run(ApplicationArguments args) {
        ensureBuiltinRole(Roles.USER,      USER_PERMISSIONS);
        ensureBuiltinRole(Roles.ADMIN,     ADMIN_PERMISSIONS);
        ensureBuiltinRole(Roles.SUPERUSER, ADMIN_PERMISSIONS);

        D11nProperties.Superuser su = properties.getSuperuser();
        if (!su.getUsername().isBlank() && !su.getPassword().isBlank()) {
            authService.syncSuperuser(su.getUsername(), su.getEmail(), su.getPassword());
            log.info("Superuser '{}' synced from configuration.", su.getUsername());
        }
    }

    private void ensureBuiltinRole(String name, Set<String> expectedPermissions) {
        Role role = roleRepository.findByName(name).orElseGet(() -> {
            log.info("Creating built-in role '{}'.", name);
            Role r = new Role();
            r.setName(name);
            r.setBuiltin(true);
            return roleRepository.save(r);
        });
        boolean changed = role.getPermissions().addAll(expectedPermissions);
        if (changed) roleRepository.save(role);
    }
}
