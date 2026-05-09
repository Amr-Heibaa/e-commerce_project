package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.RefundRequestDto;
import com.example.ecommerence_project.dto.request.RefundStatusUpdateRequest;
import com.example.ecommerence_project.dto.response.RefundResponse;
import com.example.ecommerence_project.entity.RefundRequest;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.enums.RefundStatus;
import com.example.ecommerence_project.exception.BadRequestException;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.mapper.RefundMapper;
import com.example.ecommerence_project.repository.RefundRequestRepository;
import com.example.ecommerence_project.repository.UserRepository;
import com.example.ecommerence_project.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRequestRepository refundRequestRepository;
    private final UserRepository          userRepository;
    private final RefundMapper            refundMapper;

    @Override
    public RefundResponse submitRefund(RefundRequestDto request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (refundRequestRepository.existsByUserIdAndOrderId(user.getId(), request.getOrderId())) {
            throw new BadRequestException("You have already submitted a refund for this order");
        }

        RefundRequest refund = RefundRequest.builder()
                .user(user)
                .orderId(request.getOrderId())
                .reason(request.getReason())
                .build();

        return refundMapper.toResponse(refundRequestRepository.save(refund));
    }

    @Override
    public List<RefundResponse> getMyRefunds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return refundRequestRepository.findByUserId(user.getId())
                .stream()
                .map(refundMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RefundResponse> getAllRefunds() {
        return refundRequestRepository.findAll()
                .stream()
                .map(refundMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RefundResponse> getRefundsByStatus(RefundStatus status) {
        return refundRequestRepository.findByStatus(status)
                .stream()
                .map(refundMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RefundResponse updateRefundStatus(Long refundId, RefundStatusUpdateRequest request) {
        RefundRequest refund = refundRequestRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund request not found"));

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new BadRequestException("Only PENDING refunds can be updated");
        }

        refund.setStatus(request.getStatus());
        refund.setResolvedAt(LocalDateTime.now());

        return refundMapper.toResponse(refundRequestRepository.save(refund));
    }

    @Override
    public void deleteRefund(Long refundId) {
        RefundRequest refund = refundRequestRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund request not found"));

        refundRequestRepository.delete(refund);
    }
}