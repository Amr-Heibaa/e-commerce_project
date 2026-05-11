package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.CheckoutRequest;
import com.example.ecommerence_project.dto.request.OrderStatusUpdateRequest;
import com.example.ecommerence_project.dto.response.OrderResponse;
import com.example.ecommerence_project.dto.response.PaymentResponse;
import com.example.ecommerence_project.entity.*;
import com.example.ecommerence_project.enums.OrderStatus;
import com.example.ecommerence_project.exception.BadRequestException;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.exception.UnauthorizedException;
import com.example.ecommerence_project.mapper.OrderMapper;
import com.example.ecommerence_project.repository.AddressRepository;
import com.example.ecommerence_project.repository.CartRepository;
import com.example.ecommerence_project.repository.OrderRepository;
import com.example.ecommerence_project.repository.ProductVariantRepository;
import com.example.ecommerence_project.service.OrderService;
import com.example.ecommerence_project.service.PaymentService;
import com.example.ecommerence_project.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PaymentService paymentService;
    private final OrderMapper orderMapper;
    private final CurrentUserUtil currentUserUtil;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        User user = currentUserUtil.getAuthenticatedUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + request.getAddressId()));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Address does not belong to the current user");
        }

        // Build order items and validate stock
        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            ProductVariant variant = cartItem.getProductVariant();

            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for: " + variant.getProduct().getName()
                        + " (" + variant.getSize() + "). Available: " + variant.getStockQuantity()
                );
            }

            BigDecimal subtotal = cartItem.getUnitPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            return OrderItem.builder()
                    .productVariant(variant)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .address(address)
                .status(OrderStatus.PENDING)
                .totalAmount(total)
                .notes(request.getNotes())
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        order.getItems().addAll(orderItems);

        Order saved = orderRepository.save(order);

        // Deduct stock
        orderItems.forEach(item -> {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);
        });

        // Process payment via Strategy pattern
        PaymentResponse paymentResponse = paymentService.createPayment(saved, request.getPaymentMethod());

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return orderMapper.toResponse(saved, paymentResponse);
    }

    @Override
    public List<OrderResponse> getMyOrders() {
        Long userId = currentUserUtil.getAuthenticatedUserId();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        Long userId = currentUserUtil.getAuthenticatedUserId();

        if (!isCurrentUserAdmin() && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this order");
        }

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        Long userId = currentUserUtil.getAuthenticatedUserId();
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Only PENDING or CONFIRMED orders can be cancelled");
        }

        // Restore stock
        order.getItems().forEach(item -> {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
            productVariantRepository.save(variant);
        });

        order.setStatus(OrderStatus.CANCELLED);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setStatus(request.getStatus());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
