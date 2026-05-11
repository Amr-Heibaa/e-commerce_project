package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.CheckoutRequest;
import com.example.ecommerence_project.dto.request.OrderStatusUpdateRequest;
import com.example.ecommerence_project.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {

    /**
     * Converts the current user's cart into an order and creates a payment record.
     * Deducts stock from each variant.
     * Clears the cart on success.
     */
    OrderResponse checkout(CheckoutRequest request);

    /**
     * Returns all orders for the currently authenticated user.
     */
    List<OrderResponse> getMyOrders();

    /**
     * Returns a single order by ID.
     * Throws UnauthorizedException if the order does not belong to the current user
     * (unless the caller is ADMIN).
     */
    OrderResponse getOrderById(Long orderId);

    /**
     * Cancels an order that is still in PENDING or CONFIRMED status.
     * Restores stock for each variant.
     */
    OrderResponse cancelOrder(Long orderId);

    // ── Admin operations ──────────────────────────────────────────────────────

    /**
     * Returns all orders in the system (admin only).
     */
    List<OrderResponse> getAllOrders();

    /**
     * Updates the status of any order (admin only).
     */
    OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request);
}
