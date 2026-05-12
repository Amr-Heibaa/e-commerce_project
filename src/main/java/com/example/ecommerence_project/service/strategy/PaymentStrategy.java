package com.example.ecommerence_project.service.strategy;

import com.example.ecommerence_project.entity.Payment;

public interface PaymentStrategy {

    String process(Payment payment);
}