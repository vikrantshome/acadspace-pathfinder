package com.naviksha.controller;

import com.naviksha.model.StudentReport;
import com.naviksha.service.ReportService;
import com.naviksha.service.AIServiceClient;
import com.naviksha.service.PdfGenerationService;
import com.naviksha.service.UserService; // Added
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import com.naviksha.model.User;
import lombok.Data;
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
import java.util.Optional;
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
    private final UserService userService; // Added
    private final PdfGenerationService pdfGenerationService;

    @GetMapping("/{reportId}/report-link")
    @Operation(summary = "Get report PDF link", description = "Get public link for report PDF")
    public ResponseEntity<Map<String, String>> getReportLink(
            @PathVariable String reportId,
            @RequestParam(required = false) String partner) {
        try {
            String reportLink = reportService.getReportLink(reportId, partner);
            
            if (reportLink == null) {
                // If link is not ready, return 202 Accepted (Processing)
                return ResponseEntity.accepted().body(Map.of("message", "Report generation in progress"));
            }
            
            return ResponseEntity.ok(Map.of("reportLink", reportLink));
        } catch (Exception e) {
            log.error("Error getting report link: {}", reportId, e);
            return ResponseEntity.internalServerError().build();
        }
    }


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

    @PutMapping("/{studentID}/link")
    @Operation(summary = "Save report link", description = "Saves the generated report link for a student")
    public ResponseEntity<?> saveReportLink(
            @PathVariable String studentID,
            @RequestBody ReportLinkRequest request) {
        
        Optional<User> userOptional = userService.findByStudentId(studentID);

        if (userOptional.isEmpty()) {
            log.warn("User with studentID {} not found for saving report link", studentID);
            return ResponseEntity.notFound().build();
        }
        User user = userOptional.get();
        
        Report report = reportService.getLatestReportByUserId(user.getId());

        if (report != null) {
            // Update existing report
            report.setReportLink(request.getReportLink());
            report.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new report
            report = Report.builder()
                .userId(user.getId()) // Use internal user ID
                .reportLink(request.getReportLink())
                .createdAt(LocalDateTime.now())
                .build();
        }

        try {
            Report savedReport = reportService.save(report);
            log.info("Report link saved successfully for studentID {}: {}", studentID, savedReport.getId());
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            log.error("Error saving report link for studentID {}: {}", studentID, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error saving report link: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Inner class for request body
    @Data
    static class ReportLinkRequest {
        private String reportLink;
    }
}