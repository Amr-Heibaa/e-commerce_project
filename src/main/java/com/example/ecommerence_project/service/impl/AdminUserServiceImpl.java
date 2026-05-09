package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.response.UserResponse;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.repository.UserRepository;
import com.example.ecommerence_project.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        return toResponse(findUserById(id));
    }

    @Override
    public void enableUser(Long id) {
        User user = findUserById(id);
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    public void disableUser(Long id) {
        User user = findUserById(id);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UserResponse toResponse(User user) {
        List<String> roles = user.getRoles()
                .stream()
                .map(role -> role.getName().name())
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