package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.ReviewRequest;
import com.example.ecommerence_project.dto.response.ReviewResponse;
import com.example.ecommerence_project.entity.Product;
import com.example.ecommerence_project.entity.Review;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.exception.BadRequestException;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.exception.UnauthorizedException;
import com.example.ecommerence_project.mapper.ReviewMapper;
import com.example.ecommerence_project.repository.ProductRepository;
import com.example.ecommerence_project.repository.ReviewRepository;
import com.example.ecommerence_project.repository.UserRepository;
import com.example.ecommerence_project.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository  reviewRepository;
    private final UserRepository    userRepository;
    private final ProductRepository productRepository;
    private final ReviewMapper      reviewMapper;

    @Override
    public ReviewResponse addReview(ReviewRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getReviewsByCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reviewRepository.findByUserId(user.getId())
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteReview(Long reviewId, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }
}