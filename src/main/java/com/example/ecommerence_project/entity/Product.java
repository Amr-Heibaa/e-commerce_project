package com.example.ecommerence_project.entity;


import com.example.ecommerence_project.enums.FragranceFamily;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name="product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "fragrance_family", nullable = false, length = 30)
    private FragranceFamily fragranceFamily;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

}
