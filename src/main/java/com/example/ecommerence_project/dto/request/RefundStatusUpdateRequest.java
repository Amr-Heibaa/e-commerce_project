package com.example.ecommerence_project.dto.request;

import com.example.ecommerence_project.enums.RefundStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RefundStatus status;
}