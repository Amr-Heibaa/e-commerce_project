package com.example.ecommerence_project.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long productId;
    private Long userId;
    private String username;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
