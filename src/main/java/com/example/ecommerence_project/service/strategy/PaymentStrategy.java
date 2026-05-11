package com.example.ecommerence_project.service.strategy;

import com.example.ecommerence_project.entity.Payment;

/**
 * Strategy interface for payment processing.
 *
 * Each concrete strategy handles a specific PaymentMethod
 * (e.g. credit card, cash on delivery, bank transfer).
 * New payment methods can be added without touching existing code — just
 * implement this interface and register the bean.
 */
public interface PaymentStrategy {

    /**
     * Processes the payment and returns a transaction reference string.
     * For methods that don't generate a reference (e.g. COD) return null.
     *
     * @param payment the Payment entity that has already been persisted with PENDING status
     * @return external transaction reference, or null
     */
    String process(Payment payment);
}
