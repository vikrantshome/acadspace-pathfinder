package com.naviksha.controller;

import com.naviksha.model.StudentReport;
import com.naviksha.service.ReportService;
import com.naviksha.service.AIServiceClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import com.naviksha.model.Report;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Career assessment reports")
public class ReportController {

    private final ReportService reportService;
    private final ObjectMapper objectMapper;
    private final AIServiceClient aiServiceClient;

    @GetMapping("/{reportId}")
    @Operation(summary = "Get report by ID", 
               description = "Get career report by ID",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getReport(@PathVariable String reportId, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Report report = reportService.getReport(reportId);
            
            if (report == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Return the report data
            return ResponseEntity.ok(report.getReportData());
        } catch (Exception e) {
            log.error("Error fetching report: {}", reportId, e);
            return ResponseEntity.internalServerError().body("Error fetching report");
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user reports", 
               description = "Get all reports for a specific user",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getUserReports(@PathVariable String userId, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            // TODO: Add authorization check to ensure user can only access their own reports
            
            List<Report> reports = reportService.getUserReports(userId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching user reports: {}", userId, e);
            return ResponseEntity.internalServerError().body("Error fetching user reports");
        }
    }

    @GetMapping("/demo/aisha")
    @Operation(summary = "Get demo report", description = "Get sample report for Aisha (public demo)")
    public ResponseEntity<?> getDemoReport() {
        try {
            // Load sample report from resources
            ClassPathResource resource = new ClassPathResource("data/sample_report_Aisha.json");
            StudentReport sampleReport = objectMapper.readValue(resource.getInputStream(), StudentReport.class);
            return ResponseEntity.ok(sampleReport);
        } catch (Exception e) {
            log.error("Error loading demo report", e);
            return ResponseEntity.internalServerError().body("Error loading demo report");
        }
    }

    @GetMapping("/ai-service/health")
    @Operation(summary = "Check AI service health", description = "Check if AI service is available and healthy")
    public ResponseEntity<?> checkAIServiceHealth() {
        try {
            boolean isHealthy = aiServiceClient.isHealthy();
            Map<String, Object> response = new HashMap<>();
            response.put("aiServiceHealthy", isHealthy);
            response.put("timestamp", System.currentTimeMillis());
            
            if (isHealthy) {
                response.put("message", "AI service is available and healthy");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "AI service is unavailable or unhealthy");
                return ResponseEntity.status(503).body(response);
            }
        } catch (Exception e) {
            log.error("Error checking AI service health", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("aiServiceHealthy", false);
            errorResponse.put("error", "Failed to check AI service health");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}