package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.LoginRequest;
import com.example.ecommerence_project.dto.request.RegisterRequest;
import com.example.ecommerence_project.dto.response.AuthResponse;
import com.example.ecommerence_project.dto.response.UserResponse;
import com.example.ecommerence_project.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Returns the profile of the currently authenticated user.
     * Requires a valid JWT in the Authorization header.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
