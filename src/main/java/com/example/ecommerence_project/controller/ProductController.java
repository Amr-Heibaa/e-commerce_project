package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.response.ProductImageResponse;
import com.example.ecommerence_project.dto.response.ProductResponse;
import com.example.ecommerence_project.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/{productId}/images")
    public ResponseEntity<List<ProductImageResponse>> getImages(
            @PathVariable Long productId) {
        return ResponseEntity.ok(productService.getImages(productId));
    }
}