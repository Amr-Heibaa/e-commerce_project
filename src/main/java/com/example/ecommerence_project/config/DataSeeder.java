package com.example.ecommerence_project.config;


import com.example.ecommerence_project.entity.Role;
import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.enums.RoleName;
import com.example.ecommerence_project.repository.RoleRepository;
import com.example.ecommerence_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Runs once on application start.
 * Seeds ROLE_ADMIN and ROLE_USER if they don't exist.
 * Also seeds a default admin user so the team can test admin endpoints immediately.
 *
 * IMPORTANT: Change the default admin password before any deployment!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedDefaultAdmin();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
                log.info("Seeded role: {}", roleName);
            }
        }
    }

    private void seedDefaultAdmin() {
        String adminEmail = "admin@perfumestore.com";
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found after seeding"));

        User admin = User.builder()
                .firstName("Super")
                .lastName("Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode("Admin@1234"))   // ← change in production!
                .enabled(true)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
        log.info("Seeded default admin user: {}", adminEmail);
    }


}
