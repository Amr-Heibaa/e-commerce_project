package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.ReviewRequest;
import com.example.ecommerence_project.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse addReview(ReviewRequest request, String email);

    List<ReviewResponse> getReviewsByProduct(Long productId);

    List<ReviewResponse> getReviewsByCurrentUser(String email);

    void deleteReview(Long reviewId, String email);
}
