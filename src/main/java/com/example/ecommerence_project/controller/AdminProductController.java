package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.ProductImageRequest;
import com.example.ecommerence_project.dto.request.ProductRequest;
import com.example.ecommerence_project.dto.response.ProductImageResponse;
import com.example.ecommerence_project.dto.response.FileUploadResponse;
import com.example.ecommerence_project.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import com.example.ecommerence_project.dto.response.ProductResponse;
import com.example.ecommerence_project.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok(
                fileStorageService.uploadProductImage(file)
        );
    }
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------------
    //  Image management
    // ----------------------------------------------------------------

    @PostMapping("/{productId}/images")
    public ResponseEntity<ProductImageResponse> addImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.addImage(productId, request));
    }

    @GetMapping("/{productId}/images")
    public ResponseEntity<List<ProductImageResponse>> getImages(
            @PathVariable Long productId) {
        return ResponseEntity.ok(productService.getImages(productId));
    }

    @PatchMapping("/{productId}/images/{imageId}/primary")
    public ResponseEntity<ProductImageResponse> setPrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(productService.setPrimaryImage(productId, imageId));
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        productService.deleteImage(productId, imageId);
        return ResponseEntity.noContent().build();
    }
}