package com.example.ecommerence_project.repository;

import com.example.ecommerence_project.entity.RefundRequest;
import com.example.ecommerence_project.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {

    List<RefundRequest> findByUserId(Long userId);

    List<RefundRequest> findByStatus(RefundStatus status);

    boolean existsByUserIdAndOrderId(Long userId, Long orderId);
}