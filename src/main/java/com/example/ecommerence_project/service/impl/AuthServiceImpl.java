package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.LoginRequest;
import com.example.ecommerence_project.dto.request.RegisterRequest;
import com.example.ecommerence_project.dto.response.AuthResponse;
import com.example.ecommerence_project.dto.response.UserResponse;
import com.example.ecommerence_project.entity.Role;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.enums.RoleName;
import com.example.ecommerence_project.exception.UnauthorizedException;
import com.example.ecommerence_project.repository.RoleRepository;
import com.example.ecommerence_project.repository.UserRepository;
import com.example.ecommerence_project.security.CustomUserDetails;
import com.example.ecommerence_project.security.JwtService;
import com.example.ecommerence_project.service.AuthService;
import com.example.ecommerence_project.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository  userRepository;
    private final RoleRepository  roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CurrentUserUtil currentUserUtil;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UnauthorizedException("Email already in use: " + request.getEmail());
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("ROLE_USER not seeded — run DataSeeder first"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .enabled(true)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(new CustomUserDetails(user));
        return buildAuthResponse(user, token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
            String token = jwtService.generateToken(principal);
            return buildAuthResponse(principal.getUser(), token);

        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Override
    public UserResponse getCurrentUser() {
        User user = currentUserUtil.getAuthenticatedUser();
        return toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }

    private UserResponse toUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .enabled(user.isEnabled())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }
}