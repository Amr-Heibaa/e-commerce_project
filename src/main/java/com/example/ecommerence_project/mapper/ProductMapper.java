package com.example.ecommerence_project.mapper;

import com.example.ecommerence_project.dto.request.ProductImageRequest;
import com.example.ecommerence_project.dto.request.ProductRequest;
import com.example.ecommerence_project.dto.response.ProductImageResponse;
import com.example.ecommerence_project.dto.response.ProductResponse;
import com.example.ecommerence_project.entity.Category;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.entity.ProductImage;
import com.example.ecommerence_project.dto.response.ProductVariantResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request, Category category) {
        return Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .fragranceFamily(request.getFragranceFamily())
                .category(category)
                .build();
    }

    public ProductResponse toResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setActive(product.getActive());
        response.setFragranceFamily(product.getFragranceFamily());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
        }

        // IMAGES
        if (product.getImages() != null) {

            List<ProductImageResponse> imageResponses = product.getImages()
                    .stream()
                    .map(this::imageToResponse)
                    .collect(Collectors.toList());

            response.setImages(imageResponses);

            product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .ifPresent(img ->
                            response.setPrimaryImage(imageToResponse(img)));
        } else {
            response.setImages(Collections.emptyList());
        }

        // VARIANTS
        if (product.getVariants() != null) {

            List<ProductVariantResponse> variants = product.getVariants()
                    .stream()
                    .map(variant -> ProductVariantResponse.builder()
                            .id(variant.getId())
                            .productId(product.getId())
                            .size(variant.getSize())
                            .price(variant.getPrice())
                            .stockQuantity(variant.getStockQuantity())
                            .active(variant.getActive())
                            .build())
                    .collect(Collectors.toList());

            response.setVariants(variants);
        } else {
            response.setVariants(Collections.emptyList());
        }

        return response;
    }

    // ----------------------------------------------------------------
    //  Image mapping
    // ----------------------------------------------------------------

    public ProductImage imageToEntity(ProductImageRequest request, Product product) {
        return ProductImage.builder()
                .imageUrl(request.getImageUrl())
                .altText(request.getAltText())
                .displayOrder(request.getDisplayOrder())
                .isPrimary(false)
                .product(product)
                .build();
    }

    public ProductImageResponse imageToResponse(ProductImage image) {
        ProductImageResponse response = new ProductImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setAltText(image.getAltText());
        response.setDisplayOrder(image.getDisplayOrder());
        response.setIsPrimary(image.getIsPrimary());
        response.setCreatedAt(image.getCreatedAt());
        return response;
    }
}