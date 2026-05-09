package com.example.ecommerence_project.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String size;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean active;
}