package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.request.AddressRequest;
import com.example.ecommerence_project.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {

    /**
     * Returns all addresses for the currently authenticated user.
     */
    List<AddressResponse> getMyAddresses();

    /**
     * Creates a new address for the current user.
     * If isDefault is true, clears the default flag on all other addresses first.
     */
    AddressResponse addAddress(AddressRequest request);

    /**
     * Updates an existing address owned by the current user.
     */
    AddressResponse updateAddress(Long addressId, AddressRequest request);

    /**
     * Deletes an address owned by the current user.
     */
    void deleteAddress(Long addressId);

    /**
     * Sets the given address as the default for the current user.
     */
    AddressResponse setDefault(Long addressId);
}
