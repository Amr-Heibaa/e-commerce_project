package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.RefundStatusUpdateRequest;
import com.example.ecommerence_project.dto.response.RefundResponse;
import com.example.ecommerence_project.enums.RefundStatus;
import com.example.ecommerence_project.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/refunds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRefundController {

    private final RefundService refundService;

    // GET /api/admin/refunds
    @GetMapping
    public ResponseEntity<List<RefundResponse>> getAllRefunds() {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }

    // GET /api/admin/refunds?status=PENDING
    @GetMapping("/filter")
    public ResponseEntity<List<RefundResponse>> getByStatus(
            @RequestParam RefundStatus status) {

        return ResponseEntity.ok(refundService.getRefundsByStatus(status));
    }

    // PATCH /api/admin/refunds/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<RefundResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RefundStatusUpdateRequest request) {

        return ResponseEntity.ok(refundService.updateRefundStatus(id, request));
    }

    // DELETE /api/admin/refunds/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRefund(@PathVariable Long id) {
        refundService.deleteRefund(id);
        return ResponseEntity.noContent().build();
    }
}