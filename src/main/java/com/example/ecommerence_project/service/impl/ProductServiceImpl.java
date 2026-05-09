package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.ProductRequest;
import com.example.ecommerence_project.dto.response.ProductResponse;
import com.example.ecommerence_project.entity.Category;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.mapper.ProductMapper;
import com.example.ecommerence_project.repository.CategoryRepository;
import com.example.ecommerence_project.repository.ProductRepository;
import com.example.ecommerence_project.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final  CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = new ProductMapper();
    }


    @Override
    public ProductResponse create(ProductRequest request){

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(()-> new ResourceNotFoundException("Category not found"));
        Product product = productMapper.toEntity(request, category);
        Product saved = productRepository.save(product);

        return productMapper.toResponse(saved);


    }
    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return productMapper.toResponse(product);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setActive(request.getActive());
        product.setFragranceFamily(request.getFragranceFamily());
        product.setCategory(category);

        Product updated = productRepository.save(product);

        return productMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        productRepository.delete(product);
    }


}
