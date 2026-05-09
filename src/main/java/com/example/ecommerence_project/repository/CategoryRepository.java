package com.example.ecommerence_project.repository;

import com.example.ecommerence_project.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByActive(Boolean active);

    Optional<Category> findByName(String name);

    boolean existsByName(String name);
}
