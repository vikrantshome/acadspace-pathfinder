package com.naviksha.controller;

import com.naviksha.dto.AuthRequest;
import com.naviksha.dto.AuthResponse;
import com.naviksha.dto.NlpLoginRequest;
import com.naviksha.dto.NlpProfileResponse;
import com.naviksha.dto.RegisterRequest;
import com.naviksha.model.User;
import com.naviksha.security.JwtTokenProvider;
import com.naviksha.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

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
    
    // Configurable in production, hardcoded for now as per instructions
    private static final String NLP_API_URL = "https://nlp.nexterp.in/nlp/nlp/v2/sso_profile.json";
    private static final String CLIENT_ID = "AcadSpace";

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account with email and password")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for email: {}", request.getEmail());
            User user = userService.createUser(request);
            
            // Generate JWT token
            String token = tokenProvider.generateToken(user.getId());
            
            log.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user, "User registered successfully"));
            
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/upsert-register")
    @Operation(summary = "Register or Update User", description = "Create a new user account or update an existing one based on email or studentID")
    public ResponseEntity<?> upsertRegister(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Upsert registration attempt for email: {}", request.getEmail());
            User user = userService.createOrUpdateUser(request);
            
            // Generate JWT token
            String token = tokenProvider.generateToken(user.getId());
            
            log.info("User upserted successfully: {}", user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user, "User upserted successfully"));
            
        } catch (Exception e) {
            log.error("Upsert registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            log.info("Login attempt for username: {}", request.getUsername());
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            // Get user details
            String userId = authentication.getName();
            User user = userService.findById(userId);

            if (user == null) {
                log.warn("User not found after authentication for userId: {}", userId);
                return ResponseEntity.badRequest()
                        .body(new AuthResponse("", null, "User not found after authentication."));
            }
            // Generate JWT token
            String token = tokenProvider.generateToken(user.getId());
            
            log.info("User logged in successfully: {}", user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user, "Login successful"));
            
        } catch (AuthenticationException e) {
            log.warn("Login failed for username: {}", request.getUsername());
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Username or password looks incorrect. Try again."));
        } catch (Exception e) {
            log.error("Login error for username: {}", request.getUsername(), e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/nlp-login")
    @Operation(summary = "NLP SSO Login", description = "Login using NLP SSO Token")
    public ResponseEntity<?> nlpLogin(@RequestBody NlpLoginRequest request) {
        try {
            log.info("NLP Login attempt with token: {}", request.getNlpSsoToken());
            
            if (request.getNlpSsoToken() == null || request.getNlpSsoToken().isEmpty()) {
                 return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "NLP SSO Token is missing"));
            }

            NlpProfileResponse nlpResponse;

            // --- MOCK LOGIC FOR LOCAL TESTING ---
            if ("TEST_TOKEN".equals(request.getNlpSsoToken())) {
                log.info("Using MOCK NLP response for TEST_TOKEN");
                nlpResponse = new NlpProfileResponse();
                nlpResponse.setCode(0);
                nlpResponse.setMsg("Success");
                
                NlpProfileResponse.NlpUser mockUser = new NlpProfileResponse.NlpUser();
                mockUser.setId("mock_student_123");
                mockUser.setName("Test Student");
                mockUser.setGender("Male");
                mockUser.setGrade("Class 10");
                mockUser.setMastergrade("10");
                mockUser.setSchoolName("Test Academy");
                
                nlpResponse.setUser(mockUser);
            } else {
                // --- REAL EXTERNAL API CALL ---
                // 1. Prepare Authorization Header
                String authString = CLIENT_ID + ":" + request.getNlpSsoToken();
                String authHeader = Base64.getEncoder().encodeToString(authString.getBytes(StandardCharsets.UTF_8));
                
                // 2. Call NLP API
                WebClient webClient = WebClient.create();
                ResponseEntity<NlpProfileResponse> responseEntity = webClient.post()
                        .uri(NLP_API_URL)
                        .header("sso-authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .toEntity(NlpProfileResponse.class)
                        .block(); // Blocking for simplicity in this synchronous controller

                if (responseEntity != null) {
                    HttpHeaders headers = responseEntity.getHeaders();
                    log.info("NLP Response Headers: {}", headers);
                    log.info("NLP Response Header x-nexted-trace: {}", headers.getFirst("x-nexted-trace"));
                    nlpResponse = responseEntity.getBody();
                    log.info("NLP Full Response Body: {}", nlpResponse);
                } else {
                    nlpResponse = null;
                }
            }
            // ------------------------------------
            
            log.info("NLP Response: {}", nlpResponse);

            if (nlpResponse == null) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "No response from NLP Server"));
            }
            
            if (nlpResponse.getCode() != 0) {
                 return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "NLP Login Failed: " + nlpResponse.getMsg()));
            }
            
            NlpProfileResponse.NlpUser nlpUser = nlpResponse.getUser();
            if (nlpUser == null) {
                 return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "NLP User details missing"));
            }

            if (nlpUser.getId() == null || nlpUser.getId().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("", null, "NLP User ID is missing in response"));
            }

            // 3. Map to local User and Upsert
            RegisterRequest regRequest = new RegisterRequest();
            String nlpInternalId = "NLP_" + nlpUser.getId();
            regRequest.setStudentID(nlpInternalId);
            regRequest.setName(nlpUser.getName());
            regRequest.setFullName(nlpUser.getName());
            regRequest.setSchoolName(nlpUser.getSchoolName());
            
            // Check if user exists to decide on password and email
            // We only set a random password and placeholder email for NEW users. 
            // Existing users keep their data to avoid overwriting.
            boolean userExists = userService.findByStudentId(nlpInternalId).isPresent();
            
            if (!userExists) {
                regRequest.setPassword("123456");
                // regRequest.setEmail(nlpUser.getId() + "@nlp.naviksha.com");
            }
            
            // Attempt to parse grade from 'grade' field first, then 'mastergrade'
            Integer parsedGrade = parseGrade(nlpUser.getGrade());
            if (parsedGrade == null) {
                parsedGrade = parseGrade(nlpUser.getMastergrade());
            }

            if (parsedGrade != null) {
                regRequest.setGrade(parsedGrade);
            } else {
                log.warn("Could not parse grade from: {} or {}", nlpUser.getGrade(), nlpUser.getMastergrade());
            }

            User user = userService.createOrUpdateUser(regRequest);
            
            // 4. Generate JWT
            String token = tokenProvider.generateToken(user.getId());
            
            log.info("NLP User logged in successfully: {}", user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user, "NLP Login successful"));
            
        } catch (Exception e) {
            log.error("NLP Login Error", e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "NLP Login Error: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user profile")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String userId = authentication.getName();
            User user = userService.findById(userId);
            
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

    @PostMapping("/lookup")
    @Operation(summary = "User lookup", description = "Find user by studentID or mobileNo and return JWT token")
    public ResponseEntity<?> lookup(@RequestBody com.naviksha.dto.LookupRequest request) {
        try {
            log.info("Lookup attempt for studentID: {} or mobileNo: {}", request.getStudentID(), request.getMobileNo());
            
            java.util.List<User> users = userService.findUsersByLookup(request);
            
            if (users.isEmpty()) {
                return ResponseEntity.status(404)
                    .body(new AuthResponse("", null, "User not found"));
            }
            
            if (users.size() == 1) {
                User user = users.get(0);
                // Generate JWT token
                String token = tokenProvider.generateToken(user.getId());
                
                log.info("User found and logged in successfully: {}", user.getEmail());
                return ResponseEntity.ok(new AuthResponse(token, user, "Login successful"));
            } else {
                // Multiple users found
                log.info("Multiple profiles found for mobile: {}", request.getMobileNo());
                return ResponseEntity.ok(new AuthResponse(null, null, "Multiple profiles found. Please select one.", users));
            }
            
        } catch (Exception e) {
            log.error("Lookup error", e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse("", null, "Lookup failed: " + e.getMessage()));
        }
    }    private Integer parseGrade(String gradeInput) {
        if (gradeInput == null) return null;
        
        // Normalize: remove generic words, keep alphanumeric
        String s = gradeInput.toUpperCase()
                .replace("GRADE", "")
                .replace("CLASS", "")
                .replace("std", "") // just in case
                .replaceAll("[^A-Z0-9]", "")
                .trim();
        
        // Check Roman numerals
        switch (s) {
            case "I": return 1;
            case "II": return 2;
            case "III": return 3;
            case "IV": return 4;
            case "V": return 5;
            case "VI": return 6;
            case "VII": return 7;
            case "VIII": return 8;
            case "IX": return 9;
            case "X": return 10;
            case "XI": return 11;
            case "XII": return 12;
        }
        
        // If not Roman, try extracting digits
        try {
            String digits = gradeInput.replaceAll("[^0-9]", "");
            if (!digits.isEmpty()) {
                return Integer.parseInt(digits);
            }
        } catch (NumberFormatException e) {
            // ignore
        }
        return null;
    }
}