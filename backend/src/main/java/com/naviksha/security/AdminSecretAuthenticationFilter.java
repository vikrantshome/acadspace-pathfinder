package com.naviksha.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Admin Secret Authentication Filter
 * 
 * Handles X-Admin-Secret header authentication for admin endpoints.
 * This allows admin access without requiring a user account with ROLE_ADMIN.
 * 
 * Usage:
 * - Include X-Admin-Secret header with valid admin secret
 * - Admin secret is configured via ADMIN_SECRET environment variable
 * - Only works for /admin/** endpoints
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSecretAuthenticationFilter extends OncePerRequestFilter {

    @Value("${admin.secret:}")
    private String adminSecret;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                   @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        log.debug("AdminSecretFilter processing request: {}", request.getRequestURI());
        
        // Only process admin endpoints
        if (!request.getRequestURI().startsWith("/admin/")) {
            log.debug("Not an admin endpoint, skipping: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // Skip if already authenticated
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            log.debug("Already authenticated, skipping: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // Check for admin secret header
        String providedSecret = request.getHeader("X-Admin-Secret");
        log.debug("Admin secret check - Provided: '{}', Expected: '{}'", providedSecret, adminSecret);
        
        if (StringUtils.hasText(providedSecret) && StringUtils.hasText(adminSecret)) {
            if (adminSecret.equals(providedSecret)) {
                log.info("Admin secret authentication successful for request: {}", request.getRequestURI());
                
                // Create admin authentication
                UsernamePasswordAuthenticationToken adminAuth = new UsernamePasswordAuthenticationToken(
                    "admin_secret_user",
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                );
                
                SecurityContextHolder.getContext().setAuthentication(adminAuth);
            } else {
                log.warn("Invalid admin secret provided for request: {}", request.getRequestURI());
            }
        } else {
            log.debug("No admin secret provided or admin secret not configured for request: {}", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}
