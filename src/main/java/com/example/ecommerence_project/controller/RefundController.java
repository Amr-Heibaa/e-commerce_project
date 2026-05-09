package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.RefundRequestDto;
import com.example.ecommerence_project.dto.response.RefundResponse;
import com.example.ecommerence_project.service.RefundService;
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
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    // POST /api/refunds
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RefundResponse> submitRefund(
            @Valid @RequestBody RefundRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(refundService.submitRefund(request, userDetails.getUsername()));
    }

    // GET /api/refunds/my
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RefundResponse>> getMyRefunds(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(refundService.getMyRefunds(userDetails.getUsername()));
    }
}