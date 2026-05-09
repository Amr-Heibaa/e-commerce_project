package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.ProductVariantRequest;
import com.example.ecommerence_project.dto.request.StockUpdateRequest;
import com.example.ecommerence_project.dto.response.InventoryLogResponse;
import com.example.ecommerence_project.dto.response.ProductVariantResponse;
import com.example.ecommerence_project.entity.InventoryLog;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.entity.ProductVariant;
import com.example.ecommerence_project.mapper.ProductVariantMapper;
import com.example.ecommerence_project.repository.InventoryLogRepository;
import com.example.ecommerence_project.repository.ProductRepository;
import com.example.ecommerence_project.repository.ProductVariantRepository;
import com.example.ecommerence_project.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductVariantMapper productVariantMapper;
    private final InventoryLogRepository inventoryLogRepository;   // ← added

    @Override
    @Transactional
    public ProductVariantResponse createVariant(ProductVariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        ProductVariant variant = productVariantMapper.toEntity(request, product);
        ProductVariant saved = productVariantRepository.save(variant);
        return productVariantMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getVariantById(Long id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + id));
        return productVariantMapper.toResponse(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariantsByProductId(Long productId) {
        return productVariantRepository.findByProductId(productId)
                .stream()
                .map(productVariantMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getActiveVariantsByProductId(Long productId) {
        return productVariantRepository.findByProductIdAndActiveTrue(productId)
                .stream()
                .map(productVariantMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(Long id, ProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + id));

        variant.setSize(request.getSize());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());

        ProductVariant updated = productVariantRepository.save(variant);
        return productVariantMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deactivateVariant(Long id) {
        ProductVariant variant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + id));
        variant.setActive(false);
        productVariantRepository.save(variant);
    }

    // ----------------------------------------------------------------
    //  Stock management
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public ProductVariantResponse updateStock(Long variantId, StockUpdateRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + variantId));

        int newStock = variant.getStockQuantity() + request.getQuantityChange();

        if (newStock < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Current: " + variant.getStockQuantity()
                            + ", attempted change: " + request.getQuantityChange());
        }

        variant.setStockQuantity(newStock);
        productVariantRepository.save(variant);

        InventoryLog log = InventoryLog.builder()
                .productVariant(variant)
                .quantityChange(request.getQuantityChange())
                .reason(request.getReason())
                .build();

        inventoryLogRepository.save(log);

        return productVariantMapper.toResponse(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryLogResponse> getStockLogs(Long variantId) {
        if (!productVariantRepository.existsById(variantId)) {
            throw new RuntimeException("ProductVariant not found with id: " + variantId);
        }

        return inventoryLogRepository.findByProductVariantId(variantId)
                .stream()
                .map(this::toInventoryLogResponse)
                .collect(Collectors.toList());
    }

    private InventoryLogResponse toInventoryLogResponse(InventoryLog log) {
        return InventoryLogResponse.builder()
                .id(log.getId())
                .productVariantId(log.getProductVariant().getId())
                .quantityChange(log.getQuantityChange())
                .reason(log.getReason())
                .createdAt(log.getCreatedAt())
                .build();
    }
}