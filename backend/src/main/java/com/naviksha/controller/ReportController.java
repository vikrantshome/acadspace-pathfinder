package com.naviksha.controller;

import com.naviksha.model.StudentReport;
import com.naviksha.service.ReportService;
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

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Career assessment reports")
public class ReportController {

    private final ReportService reportService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{reportId}")
    @Operation(summary = "Get report by ID", 
               description = "Get career report by ID",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getReport(@PathVariable String reportId, Authentication authentication) {
        try {
            // Implementation for getting user's report
            return ResponseEntity.ok("Report functionality coming soon");
        } catch (Exception e) {
            log.error("Error fetching report: {}", reportId, e);
            return ResponseEntity.internalServerError().body("Error fetching report");
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
}