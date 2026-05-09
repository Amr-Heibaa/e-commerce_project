package com.example.ecommerence_project.util;

import com.example.ecommerence_project.entity.User;
import com.example.ecommerence_project.exception.UnauthorizedException;
import com.example.ecommerence_project.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
        * Helper used across all service layers to get the logged-in user.
        *
        * Usage in any service:
        *   User me = currentUserUtil.getAuthenticatedUser();
 */

@Component
public class CurrentUserUtil {


    /**
     * Returns the User entity for the currently authenticated request.
     * Throws UnauthorizedException if the security context holds no principal.
     */

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedException("No authenticated user found in security context");
        }

        return ((CustomUserDetails) auth.getPrincipal()).getUser();
    }

    /**
     * Convenience method — returns just the ID.
     */
    public Long getAuthenticatedUserId() {
        return getAuthenticatedUser().getId();
    }



}
