package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.CartItemRequest;
import com.example.ecommerence_project.dto.response.CartResponse;
import com.example.ecommerence_project.entity.Cart;
import com.example.ecommerence_project.entity.CartItem;
import com.example.ecommerence_project.entity.ProductVariant;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.exception.BadRequestException;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.mapper.CartMapper;
import com.example.ecommerence_project.repository.CartItemRepository;
import com.example.ecommerence_project.repository.CartRepository;
import com.example.ecommerence_project.repository.ProductVariantRepository;
import com.example.ecommerence_project.service.CartService;
import com.example.ecommerence_project.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartMapper cartMapper;
    private final CurrentUserUtil currentUserUtil;

    @Override
    @Transactional
    public CartResponse getMyCart() {
        User user = currentUserUtil.getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);
        return cartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(CartItemRequest request) {
        User user = currentUserUtil.getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + request.getVariantId()));

        if (!Boolean.TRUE.equals(variant.getActive())) {
            throw new BadRequestException("Product variant is not available");
        }
        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + variant.getStockQuantity());
        }

        Optional<CartItem> existing = cartItemRepository
                .findByCartIdAndProductVariantId(cart.getId(), variant.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (variant.getStockQuantity() < newQty) {
                throw new BadRequestException("Insufficient stock. Available: " + variant.getStockQuantity());
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .unitPrice(variant.getPrice())
                    .build();
            cart.getItems().add(item);
            cartItemRepository.save(item);
        }

        return cartMapper.toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long cartItemId, CartItemRequest request) {
        User user = currentUserUtil.getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        ProductVariant variant = item.getProductVariant();
        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + variant.getStockQuantity());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return cartMapper.toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long cartItemId) {
        User user = currentUserUtil.getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return cartMapper.toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public void clearCart() {
        User user = currentUserUtil.getAuthenticatedUser();
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }
}
