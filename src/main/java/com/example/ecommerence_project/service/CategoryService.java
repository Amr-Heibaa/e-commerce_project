package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.CategoryRequest;
import com.example.ecommerence_project.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllActiveCategories();

    List<CategoryResponse> getAllCategories();   // admin — includes inactive

    CategoryResponse getCategoryById(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    void toggleActive(Long id);
}
