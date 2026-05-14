package com.example.ecommerence_project.mapper;
import com.example.ecommerence_project.dto.response.AddressResponse;
import com.example.ecommerence_project.dto.response.OrderItemResponse;
import com.example.ecommerence_project.dto.response.OrderResponse;
import com.example.ecommerence_project.dto.response.PaymentResponse;
import com.example.ecommerence_project.entity.Address;

import com.example.ecommerence_project.entity.Order;
import com.example.ecommerence_project.entity.OrderItem;
import com.example.ecommerence_project.entity.Payment;
import com.example.ecommerence_project.entity.ProductImage;
import com.example.ecommerence_project.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    /**
     * Maps an Order entity to an OrderResponse DTO.
     * Pass a pre-built PaymentResponse when the Payment entity
     * is not yet attached to the order (e.g. right after checkout).
     */
    public OrderResponse toResponse(Order order, PaymentResponse paymentResponse) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        // Fall back to the lazily-loaded payment if none was passed in
        PaymentResponse payment = paymentResponse;
        if (payment == null && order.getPayment() != null) {
            payment = toPaymentResponse(order.getPayment());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userFullName(order.getUser().getFullName())
                .address(toAddressResponse(order.getAddress()))
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .items(items)
                .payment(payment)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Convenience overload — no pre-built payment needed.
     */
    public OrderResponse toResponse(Order order) {
        return toResponse(order, null);
    }

    /**
     * Maps a single OrderItem entity to an OrderItemResponse DTO.
     */
    public OrderItemResponse toItemResponse(OrderItem item) {
        ProductVariant variant = item.getProductVariant();
        String imageUrl = variant.getProduct().getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .or(() -> variant.getProduct().getImages().stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse("/images/products/default-perfume.png");

        return OrderItemResponse.builder()
                .id(item.getId())
                .variantId(variant.getId())
                .productName(variant.getProduct().getName())
                .imageUrl(imageUrl)
                .variantSize(variant.getSize())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    /**
     * Maps an Address entity to an AddressResponse DTO.
     */
    public AddressResponse toAddressResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .isDefault(a.getIsDefault())
                .createdAt(a.getCreatedAt())
                .build();
    }

    /**
     * Maps a Payment entity to a PaymentResponse DTO.
     */
    public PaymentResponse toPaymentResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrder().getId())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus())
                .amount(p.getAmount())
                .transactionRef(p.getTransactionRef())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
