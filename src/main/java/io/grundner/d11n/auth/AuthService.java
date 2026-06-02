package io.grundner.d11n.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
            .username(request.username())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .roles(Set.of(loadRole(Roles.USER)))
            .build();
        userRepository.save(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return toResponse(user);
    }

    public void ensureUser(String username, String email, String password) {
        Role adminRole = loadRole(Roles.ADMIN);
        userRepository.findByUsername(username).ifPresentOrElse(user -> {
            // User exists — idempotently ensure the ADMIN role is present (handles migration from old schema)
            if (user.getRoles().stream().noneMatch(r -> r.getName().equals(Roles.ADMIN))) {
                user.getRoles().add(adminRole);
                userRepository.save(user);
            }
        }, () -> {
            User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .roles(Set.of(adminRole))
                .build();
            userRepository.save(user);
        });
    }

    public void syncSuperuser(String username, String email, String password) {
        Role superuserRole = loadRole(Roles.SUPERUSER);
        userRepository.findByUsername(username).ifPresentOrElse(user -> {
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRoles(Set.of(superuserRole));
            userRepository.save(user);
        }, () -> {
            User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .roles(Set.of(superuserRole))
                .build();
            userRepository.save(user);
        });
    }

    private Role loadRole(String name) {
        return roleRepository.findByName(name)
            .orElseThrow(() -> new IllegalStateException("Built-in role not found: " + name));
    }

    private AuthResponse toResponse(User user) {
        var roles = user.getRoles().stream().map(Role::getName).toList();
        return new AuthResponse(jwtUtil.generateToken(user.getUsername()), user.getUsername(), roles);
    }
}
