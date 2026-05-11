package com.example.ecommerence_project.service.impl;

import com.example.ecommerence_project.dto.request.AddressRequest;
import com.example.ecommerence_project.dto.response.AddressResponse;
import com.example.ecommerence_project.entity.Address;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.exception.BadRequestException;
import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.repository.AddressRepository;
import com.example.ecommerence_project.service.AddressService;
import com.example.ecommerence_project.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final CurrentUserUtil currentUserUtil;

    @Override
    public List<AddressResponse> getMyAddresses() {
        Long userId = currentUserUtil.getAuthenticatedUserId();
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse addAddress(AddressRequest request) {
        User user = currentUserUtil.getAuthenticatedUser();

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultFlag(user.getId());
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long addressId, AddressRequest request) {
        Address address = getOwnedAddress(addressId);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultFlag(address.getUser().getId());
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long addressId) {
        Address address = getOwnedAddress(addressId);
        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public AddressResponse setDefault(Long addressId) {
        Address address = getOwnedAddress(addressId);
        clearDefaultFlag(address.getUser().getId());
        address.setIsDefault(true);
        return toResponse(addressRepository.save(address));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Address getOwnedAddress(Long addressId) {
        Long userId = currentUserUtil.getAuthenticatedUserId();
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to the current user");
        }
        return address;
    }

    private void clearDefaultFlag(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(a -> {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                });
    }

    private AddressResponse toResponse(Address a) {
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
}
