package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.ProductImageRequest;
import com.example.ecommerence_project.dto.request.ProductRequest;
import com.example.ecommerence_project.dto.response.ProductImageResponse;
import com.example.ecommerence_project.dto.response.ProductResponse;
import com.example.ecommerence_project.entity.Category;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.entity.ProductImage;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.mapper.ProductMapper;
import com.example.ecommerence_project.repository.CategoryRepository;
import com.example.ecommerence_project.repository.ProductImageRepository;
import com.example.ecommerence_project.repository.ProductRepository;
import com.example.ecommerence_project.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;   // ← added
    private final ProductMapper productMapper;



    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository,
            ProductMapper productMapper
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.productMapper = productMapper;
    }

    // ----------------------------------------------------------------
    //  Existing methods — untouched
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Product product = productMapper.toEntity(request, category);
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
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
    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    // ----------------------------------------------------------------
    //  Image methods
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public ProductImageResponse addImage(Long productId, ProductImageRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductImage image = productMapper.imageToEntity(request, product);

        // first image added → automatically primary
        boolean hasImages = productImageRepository.existsByProductId(productId);
        if (!hasImages) {
            image.setIsPrimary(true);
        }

        ProductImage saved = productImageRepository.save(image);
        return productMapper.imageToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImages(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }

        return productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId)
                .stream()
                .map(productMapper::imageToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductImageResponse setPrimaryImage(Long productId, Long imageId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }

        // unset current primary
        productImageRepository.findByProductIdAndIsPrimaryTrue(productId)
                .ifPresent(current -> {
                    current.setIsPrimary(false);
                    productImageRepository.save(current);
                });

        // set new primary
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        image.setIsPrimary(true);
        ProductImage saved = productImageRepository.save(image);
        return productMapper.imageToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }

        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());
        productImageRepository.delete(image);

        // if deleted image was primary → promote next image
        if (wasPrimary) {
            productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId)
                    .stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setIsPrimary(true);
                        productImageRepository.save(next);
                    });
        }
    }
}