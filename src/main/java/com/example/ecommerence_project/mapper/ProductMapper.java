package com.example.ecommerence_project.mapper;



import com.example.ecommerence_project.dto.request.ProductRequest;
import com.example.ecommerence_project.dto.response.ProductResponse;
import com.example.ecommerence_project.entity.Category;
import com.example.ecommerence_project.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request, Category category) {
        return Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .fragranceFamily(request.getFragranceFamily())
                .category(category)
                .build();
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setActive(product.getActive());
        response.setFragranceFamily(product.getFragranceFamily());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
        }

        return response;
    }
}