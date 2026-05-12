package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.CheckoutRequest;
import com.example.ecommerence_project.dto.response.OrderResponse;
import com.example.ecommerence_project.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** POST /api/orders/checkout — place an order from the current cart */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(request));
    }

    /** GET /api/orders — list the current user's orders */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    /** GET /api/orders/my — same as above, alternative endpoint */
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrdersAlt() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }
    /** GET /api/orders/{id} — get a single order */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /** PATCH /api/orders/{id}/cancel — cancel a pending/confirmed order */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}
