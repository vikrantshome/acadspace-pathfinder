package com.naviksha.controller;

import com.naviksha.dto.SeedResultDTO;
import com.naviksha.model.Career;
import com.naviksha.model.AdminAudit;
import com.naviksha.service.AdminService;
import com.naviksha.service.CareerService;
import com.naviksha.service.SeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller
 * 
 * Provides administrative functions for managing careers, tests, and system data
 * 
 * ADMIN ENDPOINTS (Requires ADMIN role):
 * - GET /api/admin/careers - List all careers
 * - POST /api/admin/careers - Add new career
 * - PUT /api/admin/careers/{careerId} - Update career
 * - DELETE /api/admin/careers/{careerId} - Delete career
 * - POST /api/admin/seed - Seed database from data files
 * - POST /api/admin/recompute/{userId} - Recompute user's latest report
 * - GET /api/admin/audit - View admin action logs
 * 
 * ADMIN ACCESS CONTROL:
 * - Requires ROLE_ADMIN or ADMIN_SECRET header
 * - All actions are logged to admin_audit collection
 * - Provides comprehensive career management capabilities
 * 
 * HOW TO BECOME ADMIN:
 * 1. Set ADMIN_SECRET environment variable
 * 2. Include X-Admin-Secret header in requests, OR
 * 3. Have user account with ROLE_ADMIN (created during seed)
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "Administrative functions (requires ADMIN role)")
public class AdminController {

    private final CareerService careerService;
    private final SeedService seedService;
    private final AdminService adminService;

    @GetMapping("/careers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all careers", 
               description = "Get all careers for admin management",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<Career>> getAllCareers(Authentication authentication) {
        try {
            adminService.logAction(getAdminUser(authentication), "LIST_CAREERS", "Retrieved all careers");
            List<Career> careers = careerService.getAllCareers();
            return ResponseEntity.ok(careers);
        } catch (Exception e) {
            log.error("Error fetching careers for admin", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/careers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add new career", 
               description = "Create a new career entry",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> addCareer(
            @Valid @RequestBody Career career,
            Authentication authentication) {
        try {
            String adminUser = getAdminUser(authentication);
            Career savedCareer = careerService.saveCareer(career);
            
            adminService.logAction(adminUser, "ADD_CAREER", 
                "Added career: " + career.getCareerName());
            
            return ResponseEntity.ok(Map.of(
                "career", savedCareer,
                "message", "Career added successfully"
            ));
        } catch (Exception e) {
            log.error("Error adding career", e);
            return ResponseEntity.internalServerError()
                .body("Error adding career: " + e.getMessage());
        }
    }

    @PutMapping("/careers/{careerId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update career", 
               description = "Update existing career",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> updateCareer(
            @PathVariable String careerId,
            @Valid @RequestBody Career career,
            Authentication authentication) {
        try {
            String adminUser = getAdminUser(authentication);
            career.setCareerId(careerId);
            Career updatedCareer = careerService.updateCareer(career);
            
            if (updatedCareer == null) {
                return ResponseEntity.notFound().build();
            }
            
            adminService.logAction(adminUser, "UPDATE_CAREER", 
                "Updated career: " + career.getCareerName());
            
            return ResponseEntity.ok(Map.of(
                "career", updatedCareer,
                "message", "Career updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating career: {}", careerId, e);
            return ResponseEntity.internalServerError()
                .body("Error updating career: " + e.getMessage());
        }
    }

    @DeleteMapping("/careers/{careerId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete career", 
               description = "Delete career by ID",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> deleteCareer(
            @PathVariable String careerId,
            Authentication authentication) {
        try {
            String adminUser = getAdminUser(authentication);
            Career career = careerService.findByCareerId(careerId);
            
            if (career == null) {
                return ResponseEntity.notFound().build();
            }
            
            careerService.deleteCareer(careerId);
            
            adminService.logAction(adminUser, "DELETE_CAREER", 
                "Deleted career: " + career.getCareerName());
            
            return ResponseEntity.ok(Map.of(
                "message", "Career deleted successfully"
            ));
        } catch (Exception e) {
            log.error("Error deleting career: {}", careerId, e);
            return ResponseEntity.internalServerError()
                .body("Error deleting career: " + e.getMessage());
        }
    }

    @PostMapping("/seed")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Seed database", 
               description = "Import data from CSV/JSON files into database",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> seedDatabase(Authentication authentication) {
        try {
            String adminUser = getAdminUser(authentication);
            log.info("Starting database seed requested by: {}", adminUser);
            
            SeedResultDTO result = seedService.seedDatabase();
            
            adminService.logAction(adminUser, "SEED_DATABASE", 
                String.format("Seeded database - Careers: %d, Tests: %d, Users: %d", 
                    result.getCareersImported(), result.getTestsImported(), result.getUsersCreated()));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error seeding database", e);
            return ResponseEntity.internalServerError()
                .body("Error seeding database: " + e.getMessage());
        }
    }

    @PostMapping("/recompute/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Recompute user report", 
               description = "Recompute latest career report for user",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> recomputeUserReport(
            @PathVariable String userId,
            Authentication authentication) {
        try {
            String adminUser = getAdminUser(authentication);
            
            // This would recompute the user's latest report from stored progress
            // Implementation depends on how you want to handle recomputation
            
            adminService.logAction(adminUser, "RECOMPUTE_REPORT", 
                "Recomputed report for user: " + userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Report recomputation initiated for user: " + userId
            ));
        } catch (Exception e) {
            log.error("Error recomputing report for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                .body("Error recomputing report: " + e.getMessage());
        }
    }

    @GetMapping("/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs", 
               description = "View admin action audit logs",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<AdminAudit>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        try {
            List<AdminAudit> auditLogs = adminService.getAuditLogs(page, size);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            log.error("Error fetching audit logs", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system statistics", 
               description = "Get overview statistics for admin dashboard",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getSystemStats(Authentication authentication) {
        try {
            Map<String, Object> stats = adminService.getSystemStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching system stats", e);
            return ResponseEntity.internalServerError()
                .body("Error fetching system statistics");
        }
    }

    @GetMapping("/analytics/reports-summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get reports summary for analytics", 
               description = "Get a paginated list of report summaries for the data grid",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Page<com.naviksha.dto.ReportSummaryDTO>> getReportsSummary(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<com.naviksha.dto.ReportSummaryDTO> summaryPage = adminService.getReportsSummary(pageable);
            return ResponseEntity.ok(summaryPage);
        } catch (Exception e) {
            log.error("Error fetching reports summary", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getAdminUser(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            return authentication.getName();
        }
        return "anonymous_admin";
    }
}