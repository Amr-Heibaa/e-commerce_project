package com.example.ecommerence_project.mapper;

import com.example.ecommerence_project.dto.response.RefundResponse;
import com.example.ecommerence_project.entity.RefundRequest;
import org.springframework.stereotype.Component;

@Component
public class RefundMapper {

    public RefundResponse toResponse(RefundRequest refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .orderId(refund.getOrderId())
                .userId(refund.getUser().getId())
                .username(refund.getUser().getFullName())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .createdAt(refund.getCreatedAt())
                .resolvedAt(refund.getResolvedAt())
                .build();
    }
}