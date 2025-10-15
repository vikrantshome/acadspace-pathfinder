package com.naviksha.controller;

import com.naviksha.dto.AuthRequest;
import com.naviksha.dto.AuthResponse;
import com.naviksha.dto.RegisterRequest;
import com.naviksha.model.User;
import com.naviksha.security.JwtTokenProvider;
import com.naviksha.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Authentication Controller
 * 
 * Handles user registration and login endpoints
 * 
 * HOW TO USE:
 * 1. Register: POST /api/auth/register with email, password, name
 * 2. Login: POST /api/auth/login with email, password
 * 3. Both return JWT token for subsequent API calls
 * 
 * SECURITY FEATURES:
 * - BCrypt password hashing
 * - JWT token generation with expiry
 * - Input validation
 * - Authentication error handling
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication and registration")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account with email and password")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for email: {}", request.getEmail());
            
            // Check if user already exists
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "Email already registered"));
            }
            
            // Create new user
            User user = userService.createUser(request);
            
            // Generate JWT token
            String token = tokenProvider.generateToken(user.getEmail());
            
            log.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user, "User registered successfully"));
            
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            
            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Get user details
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "User not found"));
            }
            
            // Generate JWT token
            String token = tokenProvider.generateToken(user.getEmail());
            
            log.info("User logged in successfully: {}", user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user, "Login successful"));
            
        } catch (AuthenticationException e) {
            log.warn("Login failed for email: {}", request.getEmail());
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Email or password looks incorrect. Try again."));
        } catch (Exception e) {
            log.error("Login error for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user profile")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "User not found"));
            }
            
            return ResponseEntity.ok(new AuthResponse("", user, "User profile retrieved"));
            
        } catch (Exception e) {
            log.error("Error getting current user", e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Error retrieving user profile"));
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update user profile information")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            log.info("Profile update request received. Authentication: {}", authentication);
            log.info("Authentication name: {}", authentication != null ? authentication.getName() : "null");
            
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Authentication is null or not authenticated");
                return ResponseEntity.status(401)
                    .body(new AuthResponse("", null, "Authentication required"));
            }
            
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "User not found"));
            }
            
            // Update profile fields
            if (updates.containsKey("fullName")) {
                user.setFullName((String) updates.get("fullName"));
            }
            if (updates.containsKey("schoolName")) {
                user.setSchoolName((String) updates.get("schoolName"));
            }
            if (updates.containsKey("grade")) {
                user.setGrade((Integer) updates.get("grade"));
            }
            if (updates.containsKey("board")) {
                user.setBoard((String) updates.get("board"));
            }
            
            User updatedUser = userService.save(user);
            
            log.info("Profile updated for user: {}", email);
            return ResponseEntity.ok(new AuthResponse("", updatedUser, "Profile updated successfully"));
            
        } catch (Exception e) {
            log.error("Error updating profile for user: {}", authentication.getName(), e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Error updating profile: " + e.getMessage()));
        }
    }
}