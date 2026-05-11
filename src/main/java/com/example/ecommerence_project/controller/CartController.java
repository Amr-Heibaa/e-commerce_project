package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.CartItemRequest;
import com.example.ecommerence_project.dto.response.CartResponse;
import com.example.ecommerence_project.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /** GET /api/cart — view the current user's cart */
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    /** POST /api/cart/items — add a variant to the cart */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(request));
    }

    /** PUT /api/cart/items/{id} — update quantity of a cart item */
    @PutMapping("/items/{id}")
    public ResponseEntity<CartResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItem(id, request));
    }

    /** DELETE /api/cart/items/{id} — remove a single item */
    @DeleteMapping("/items/{id}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long id) {
        return ResponseEntity.ok(cartService.removeItem(id));
    }

    /** DELETE /api/cart — clear the entire cart */
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
