package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.response.ProductVariantResponse;
import com.example.ecommerence_project.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getVariantById(
            @PathVariable Long id) {
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
}