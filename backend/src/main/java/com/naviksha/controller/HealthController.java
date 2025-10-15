package com.naviksha.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Health Check Controller
 * 
 * Provides health check endpoints for monitoring and load balancers
 * 
 * ENDPOINTS:
 * - GET /health - Basic health check
 * - GET /actuator/health - Spring Boot Actuator health check
 * 
 * These endpoints are configured as public (no authentication required)
 * in SecurityConfig for monitoring purposes.
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Basic health check endpoint for monitoring")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "service", "naviksha-backend",
                "version", "1.0.0"
            );
            
            log.debug("Health check requested - service is UP");
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            log.error("Health check failed", e);
            return ResponseEntity.status(503).body(Map.of(
                "status", "DOWN",
                "timestamp", LocalDateTime.now().toString(),
                "error", e.getMessage()
            ));
        }
    }
}

