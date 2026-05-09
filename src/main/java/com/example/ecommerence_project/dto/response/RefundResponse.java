package com.example.ecommerence_project.dto.response;

import com.example.ecommerence_project.enums.RefundStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundResponse {

    private Long id;
    private Long orderId;
    private Long userId;
    private String username;
    private String reason;
    private RefundStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}