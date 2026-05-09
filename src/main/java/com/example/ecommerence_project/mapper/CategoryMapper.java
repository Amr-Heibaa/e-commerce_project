package com.example.ecommerence_project.mapper;

import com.example.ecommerence_project.dto.request.CategoryRequest;
import com.example.ecommerence_project.dto.response.CategoryResponse;
import com.example.ecommerence_project.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    public Category toEntity(CategoryRequest request) {
        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .build();
    }
    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
    public void updateEntity(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.isActive());
    }
}
