package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.ProductVariantRequest;
import com.example.ecommerence_project.dto.request.StockUpdateRequest;
import com.example.ecommerence_project.dto.response.InventoryLogResponse;
import com.example.ecommerence_project.dto.response.ProductVariantResponse;
import com.example.ecommerence_project.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @PostMapping
    public ResponseEntity<ProductVariantResponse> createVariant(
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productVariantService.createVariant(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getVariantById(@PathVariable Long id) {
        return ResponseEntity.ok(productVariantService.getVariantById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>> getVariantsByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(productId));
    }

    @GetMapping("/product/{productId}/active")
    public ResponseEntity<List<ProductVariantResponse>> getActiveVariantsByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getActiveVariantsByProductId(productId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(productVariantService.updateVariant(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateVariant(@PathVariable Long id) {
        productVariantService.deactivateVariant(id);
        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------------
    //  Stock management
    // ----------------------------------------------------------------

    @PatchMapping("/{variantId}/stock")
    public ResponseEntity<ProductVariantResponse> updateStock(
            @PathVariable Long variantId,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(productVariantService.updateStock(variantId, request));
    }

    @GetMapping("/{variantId}/stock/logs")
    public ResponseEntity<List<InventoryLogResponse>> getStockLogs(
            @PathVariable Long variantId) {
        return ResponseEntity.ok(productVariantService.getStockLogs(variantId));
    }
}