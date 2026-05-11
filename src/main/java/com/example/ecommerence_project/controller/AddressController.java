package com.example.ecommerence_project.controller;

import com.example.ecommerence_project.dto.request.AddressRequest;
import com.example.ecommerence_project.dto.response.AddressResponse;
import com.example.ecommerence_project.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /** GET /api/addresses — list all addresses for the current user */
    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses());
    }

    /** POST /api/addresses — add a new address */
    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(@Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.addAddress(request));
    }

    /** PUT /api/addresses/{id} — update an existing address */
    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(id, request));
    }

    /** DELETE /api/addresses/{id} — delete an address */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/addresses/{id}/default — set as default address */
    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefault(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefault(id));
    }
}
