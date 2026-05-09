package com.example.ecommerence_project.mapper;

import com.example.ecommerence_project.dto.request.ProductVariantRequest;
import com.example.ecommerence_project.dto.response.ProductVariantResponse;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.entity.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariant toEntity(ProductVariantRequest request, Product product) {
        return ProductVariant.builder()
                .product(product)
                .size(request.getSize())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .build();
    }

    public ProductVariantResponse toResponse(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .size(variant.getSize())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .active(variant.getActive())
                .build();
    }
}