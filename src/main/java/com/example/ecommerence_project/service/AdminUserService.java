package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.response.UserResponse;

import java.util.List;

public interface AdminUserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    void enableUser(Long id);

    void disableUser(Long id);

    void deleteUser(Long id);
}