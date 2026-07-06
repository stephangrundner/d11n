package io.grundner.d11n.api.user.dto;

import io.grundner.d11n.domain.user.User;

public record UserSummary(Long id, String email) {

    public static UserSummary from(User u) {
        return new UserSummary(u.getId(), u.getEmail());
    }
}
