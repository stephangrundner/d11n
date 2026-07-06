package io.grundner.d11n.api.auth;

import io.grundner.d11n.api.auth.dto.LoginRequest;
import io.grundner.d11n.api.auth.dto.RegisterRequest;
import io.grundner.d11n.api.auth.dto.TokenResponse;
import io.grundner.d11n.application.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public TokenResponse login(@RequestBody @Valid LoginRequest request) {
        return TokenResponse.bearer(authService.login(request.email(), request.password()));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request.email(), request.password());
    }
}
