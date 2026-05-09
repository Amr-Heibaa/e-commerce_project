package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.RefundRequestDto;
import com.example.ecommerence_project.dto.request.RefundStatusUpdateRequest;
import com.example.ecommerence_project.dto.response.RefundResponse;
import com.example.ecommerence_project.enums.RefundStatus;

import java.util.List;

public interface RefundService {

    RefundResponse submitRefund(RefundRequestDto request, String email);

    List<RefundResponse> getMyRefunds(String email);

    List<RefundResponse> getAllRefunds();

    List<RefundResponse> getRefundsByStatus(RefundStatus status);

    RefundResponse updateRefundStatus(Long refundId, RefundStatusUpdateRequest request);

    void deleteRefund(Long refundId);
}