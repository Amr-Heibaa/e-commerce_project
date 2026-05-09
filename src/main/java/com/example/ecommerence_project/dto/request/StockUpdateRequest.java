package com.example.ecommerence_project.dto.request;

import com.example.ecommerence_project.enums.StockChangeReason;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockUpdateRequest {

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;

    @NotNull(message = "Reason is required")
    private StockChangeReason reason;
}