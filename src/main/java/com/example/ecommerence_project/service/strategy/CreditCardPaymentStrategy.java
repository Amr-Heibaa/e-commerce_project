package com.example.ecommerence_project.service.strategy;

import com.example.ecommerence_project.entity.Payment;
import org.springframework.stereotype.Component;

@Component("CREDIT_CARD")
public class CreditCardPaymentStrategy implements PaymentStrategy {

    @Override
    public String process(Payment payment) {
        return "CC-" + System.currentTimeMillis();
    }
}