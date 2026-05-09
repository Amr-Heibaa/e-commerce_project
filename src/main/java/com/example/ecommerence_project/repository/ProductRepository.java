package com.example.ecommerence_project.repository;

import com.example.ecommerence_project.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
