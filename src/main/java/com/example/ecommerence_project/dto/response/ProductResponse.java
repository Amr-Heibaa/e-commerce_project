package com.example.ecommerence_project.dto.response;

import com.example.ecommerence_project.enums.FragranceFamily;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private FragranceFamily fragranceFamily;
    private Long categoryId;
    private String categoryName;
    private ProductImageResponse primaryImage;           // ← added
    private List<ProductImageResponse> images;          // ← added
    private List<ProductVariantResponse> variants;

}
