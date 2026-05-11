package com.example.ecommerence_project.security;

import com.example.ecommerence_project.exception.ResourceNotFoundException;
import com.example.ecommerence_project.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final UserRepository userRepository;

    // @Lazy breaks the circular dependency
    public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                          UserRepository userRepository) {
        this.jwtAuthFilter               = jwtAuthFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.userRepository              = userRepository;
    }

    // NOTE for Dev 3: inject JwtAccessDeniedHandler here when ready

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
            return new CustomUserDetails(user);
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/products/**",
                                "/api/categories/**",
                                "/api/reviews/product/**"
                        ).permitAll()
                        .requestMatchers(
                                "/", "/index.html", "/login.html", "/register.html",
                                "/products.html", "/product-details.html",
                                "/admin-dashboard.html", "/admin-users.html",
                                "/admin-refunds.html", "/admin-categories.html",
                                "/admin-products.html", "/admin-orders.html",
                                "/cart.html", "/checkout.html", "/my-orders.html",
                                "/js/**", "/css/**"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(
                                "/api/cart/**",
                                "/api/orders/**",
                                "/api/addresses/**",
                                "/api/reviews/**",
                                "/api/refunds/**"
                        ).authenticated()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService());

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}