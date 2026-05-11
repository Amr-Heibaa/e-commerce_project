package com.example.ecommerence_project.mapper;

import com.example.ecommerence_project.dto.response.CartItemResponse;
import com.example.ecommerence_project.dto.response.CartResponse;
import com.example.ecommerence_project.entity.Cart;
import com.example.ecommerence_project.entity.CartItem;
import com.example.ecommerence_project.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    /**
     * Maps a Cart entity to a CartResponse DTO.
     * Calculates totalAmount and totalItems from the item list.
     */
    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalAmount(total)
                .totalItems(totalItems)
                .build();
    }

    /**
     * Maps a single CartItem entity to a CartItemResponse DTO.
     */
    public CartItemResponse toItemResponse(CartItem item) {
        ProductVariant variant = item.getProductVariant();

        BigDecimal subtotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        // Use the primary image if available
        String imageUrl = variant.getProduct().getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(null);

        return CartItemResponse.builder()
                .id(item.getId())
                .variantId(variant.getId())
                .productName(variant.getProduct().getName())
                .variantSize(variant.getSize())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(subtotal)
                .imageUrl(imageUrl)
                .build();
    }
}
