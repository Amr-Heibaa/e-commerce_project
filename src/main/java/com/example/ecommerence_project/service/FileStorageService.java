package com.example.ecommerence_project.service;

import com.example.ecommerence_project.dto.response.FileUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String UPLOAD_DIR =
            "uploads/products";

    public FileUploadResponse uploadProductImage(MultipartFile file) {

        try {

            Path uploadPath = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();

            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension =
                        originalName.substring(
                                originalName.lastIndexOf("."));
            }

            String fileName =
                    UUID.randomUUID() + extension;

            Path filePath =
                    uploadPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return FileUploadResponse.builder()
                    .fileName(fileName)
                    .fileUrl("/uploads/products/" + fileName)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to upload image", e);
        }
    }
}