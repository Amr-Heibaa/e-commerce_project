package com.example.ecommerence_project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required at")

    @Size(max = 100)
    private String name;

    private String description;

    @Size(max = 255)
    private String imageUrl;

    private boolean active = true;
}
