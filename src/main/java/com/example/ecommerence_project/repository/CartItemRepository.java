package com.example.ecommerence_project.repository;

import com.example.ecommerence_project.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductVariantId(Long cartId, Long variantId);

    void deleteByCartId(Long cartId);
}
