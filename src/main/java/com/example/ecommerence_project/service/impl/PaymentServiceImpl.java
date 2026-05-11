package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.response.PaymentResponse;
import com.example.ecommerence_project.entity.Order;
import com.example.ecommerence_project.entity.Payment;
import com.example.ecommerence_project.enums.PaymentMethod;
import com.example.ecommerence_project.enums.PaymentStatus;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.repository.PaymentRepository;
import com.example.ecommerence_project.service.PaymentService;
import com.example.ecommerence_project.service.strategy.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * PaymentServiceImpl uses the Strategy pattern to delegate the actual
 * payment processing to the correct {@link PaymentStrategy} implementation.
 *
 * Spring injects all PaymentStrategy beans into the map keyed by bean name,
 * which matches the PaymentMethod enum name (e.g. "CREDIT_CARD").
 */
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    /**
     * Spring auto-populates this map: key = bean name (e.g. "CREDIT_CARD"),
     * value = the corresponding PaymentStrategy bean.
     */
    private final Map<String, PaymentStrategy> paymentStrategies;

    @Override
    @Transactional
    public PaymentResponse createPayment(Order order, PaymentMethod paymentMethod) {
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(paymentMethod)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .build();

        payment = paymentRepository.save(payment);

        // Resolve the correct strategy by payment method name
        PaymentStrategy strategy = paymentStrategies.get(paymentMethod.name());
        if (strategy == null) {
            throw new IllegalStateException("No payment strategy found for: " + paymentMethod);
        }

        String transactionRef = strategy.process(payment);
        payment.setTransactionRef(transactionRef);

        // COD stays PENDING; all other methods are immediately COMPLETED in this mock
        if (paymentMethod != PaymentMethod.CASH_ON_DELIVERY) {
            payment.setStatus(PaymentStatus.COMPLETED);
        }

        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        return toResponse(payment);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrder().getId())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus())
                .amount(p.getAmount())
                .transactionRef(p.getTransactionRef())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
