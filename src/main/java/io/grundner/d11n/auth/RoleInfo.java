package io.grundner.d11n.auth;

import java.util.Set;

public record RoleInfo(Long id, String name, boolean builtin, Set<String> permissions) {

    static RoleInfo from(Role role) {
        return new RoleInfo(role.getId(), role.getName(), role.isBuiltin(), Set.copyOf(role.getPermissions()));
    }
}
