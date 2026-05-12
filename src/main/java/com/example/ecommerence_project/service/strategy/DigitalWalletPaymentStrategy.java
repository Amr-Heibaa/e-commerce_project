package com.example.ecommerence_project.service.strategy;

import com.example.ecommerence_project.entity.Payment;
import org.springframework.stereotype.Component;

@Component("DIGITAL_WALLET")
public class DigitalWalletPaymentStrategy implements PaymentStrategy {

    @Override
    public String process(Payment payment) {
        return "DW-" + System.currentTimeMillis();
    }
}