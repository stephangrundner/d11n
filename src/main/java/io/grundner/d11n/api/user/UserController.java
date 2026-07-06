package io.grundner.d11n.api.user;

import io.grundner.d11n.api.user.dto.UserSummary;
import io.grundner.d11n.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public List<UserSummary> search(@RequestParam String q) {
        if (q.isBlank()) return List.of();
        return userRepository.findTop10ByEmailContainingIgnoreCase(q).stream()
                .map(UserSummary::from)
                .toList();
    }
}
