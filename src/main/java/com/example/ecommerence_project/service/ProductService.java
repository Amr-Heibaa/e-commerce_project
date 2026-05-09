package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.ProductRequest;
import com.example.ecommerence_project.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductRequest request);

    List<ProductResponse> getAll();

    ProductResponse getById(Long id);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);


}
