package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.response.PaymentResponse;
import com.example.ecommerence_project.entity.Order;
import com.example.ecommerence_project.enums.PaymentMethod;

public interface PaymentService {

    /**
     * Creates a payment record for the given order.
     * Called internally by OrderService during checkout.
     */
    PaymentResponse createPayment(Order order, PaymentMethod paymentMethod);

    /**
     * Returns the payment associated with an order.
     */
    PaymentResponse getPaymentByOrderId(Long orderId);
}
