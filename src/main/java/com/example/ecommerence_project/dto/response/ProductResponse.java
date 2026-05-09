package com.example.ecommerence_project.dto.response;

import com.example.ecommerence_project.enums.FragranceFamily;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private FragranceFamily fragranceFamily;
    private Long categoryId;
}

