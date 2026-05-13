package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.CategoryRequest;
import com.example.ecommerence_project.dto.response.CategoryResponse;
import com.example.ecommerence_project.entity.Category;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.exception.UnauthorizedException;
import com.example.ecommerence_project.repository.ProductRepository;
import com.example.ecommerence_project.mapper.CategoryMapper;
import com.example.ecommerence_project.repository.CategoryRepository;
import com.example.ecommerence_project.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ProductRepository productRepository;

    @Override
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllByActive(true)
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        return categoryMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new UnauthorizedException("Category name already exists: " + request.getName());
        }
        Category saved = categoryRepository.save(categoryMapper.toEntity(request));
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findOrThrow(id);
        categoryMapper.updateEntity(category, request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = findOrThrow(id);

        // Unlink all products from this category instead of deleting them
        for (Product product : category.getProducts()) {
            product.setCategory(null);
        }
        productRepository.saveAll(category.getProducts());

        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public void toggleActive(Long id) {
        Category category = findOrThrow(id);
        category.setActive(!category.getActive());
        categoryRepository.save(category);
    }


    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("Category not found with id: " + id));
    }

}