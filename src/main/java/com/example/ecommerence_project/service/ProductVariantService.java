package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.ProductVariantRequest;
import com.example.ecommerence_project.dto.request.StockUpdateRequest;
import com.example.ecommerence_project.dto.response.InventoryLogResponse;
import com.example.ecommerence_project.dto.response.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse createVariant(ProductVariantRequest request);

    ProductVariantResponse getVariantById(Long id);

    List<ProductVariantResponse> getVariantsByProductId(Long productId);

    List<ProductVariantResponse> getActiveVariantsByProductId(Long productId);

    ProductVariantResponse updateVariant(Long id, ProductVariantRequest request);

    void deactivateVariant(Long id);

    ProductVariantResponse updateStock(Long variantId, StockUpdateRequest request);

    List<InventoryLogResponse> getStockLogs(Long variantId);
}