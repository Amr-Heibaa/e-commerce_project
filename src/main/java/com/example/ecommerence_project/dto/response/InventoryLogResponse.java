package com.example.ecommerence_project.dto.response;

import com.example.ecommerence_project.enums.StockChangeReason;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryLogResponse {

    private Long id;
    private Long productVariantId;
    private Integer quantityChange;
    private StockChangeReason reason;
    private LocalDateTime createdAt;
}