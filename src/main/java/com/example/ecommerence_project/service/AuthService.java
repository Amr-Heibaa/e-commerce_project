package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.LoginRequest;
import com.example.ecommerence_project.dto.request.RegisterRequest;
import com.example.ecommerence_project.dto.response.AuthResponse;
import com.example.ecommerence_project.dto.response.UserResponse;

public interface AuthService {
    /**
     * Registers a new customer account with ROLE_USER.
     * Throws BadRequestException if the email is already taken.
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticates credentials and returns a signed JWT.
     * Throws UnauthorizedException if credentials are invalid.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Returns the profile of the currently authenticated user.
     */
    UserResponse getCurrentUser();
}
