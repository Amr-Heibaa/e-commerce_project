package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.CartItemRequest;
import com.example.ecommerence_project.dto.response.CartResponse;

public interface CartService {

    /**
     * Returns the cart for the currently authenticated user.
     * Creates an empty cart if one does not yet exist.
     */
    CartResponse getMyCart();

    /**
     * Adds a variant to the cart, or increments quantity if already present.
     */
    CartResponse addItem(CartItemRequest request);

    /**
     * Updates the quantity of an existing cart item.
     * Throws ResourceNotFoundException if the item does not belong to the user's cart.
     */
    CartResponse updateItem(Long cartItemId, CartItemRequest request);

    /**
     * Removes a single item from the cart.
     */
    CartResponse removeItem(Long cartItemId);

    /**
     * Empties the cart (removes all items).
     */
    void clearCart();
}
