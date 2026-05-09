package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.ReviewRequest;
import com.example.ecommerence_project.dto.response.ReviewResponse;
import com.example.ecommerence_project.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/reviews
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> addReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(request, userDetails.getUsername()));
    }

    // GET /api/reviews/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    // GET /api/reviews/my
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(reviewService.getReviewsByCurrentUser(userDetails.getUsername()));
    }

    // DELETE /api/reviews/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        reviewService.deleteReview(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}