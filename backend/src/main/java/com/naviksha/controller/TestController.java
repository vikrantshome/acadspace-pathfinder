package com.naviksha.controller;

import com.naviksha.dto.TestSubmissionDTO;
import com.naviksha.model.*;
import com.naviksha.service.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Test Controller
 * 
 * Manages career assessment tests and submissions
 * 
 * ENDPOINTS:
 * - GET /api/tests - List available tests (vibematch, edustats)
 * - GET /api/tests/{testId} - Get specific test questions
 * - POST /api/tests/{testId}/submit - Submit test answers and get report
 * - GET /api/progress/{userId} - Get user's test progress
 * - POST /api/progress/save - Save user's test progress
 * - POST /api/progress/reset - Reset user's test progress
 * 
 * HOW TEST FLOW WORKS:
 * 1. User gets test questions from /api/tests/{testId}
 * 2. User can save progress during test with /api/progress/save
 * 3. User submits completed test with /api/tests/{testId}/submit
 * 4. Backend computes career matches and returns report
 * 5. Report is stored and can be retrieved later
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tests", description = "Career assessment tests and submissions")
public class TestController {

    private final TestService testService;
    private final ProgressService progressService;
    private final ScoringService scoringService;
    private final ReportService reportService;
    private final UserService userService;
    private final EmailService emailService;

    @GetMapping("/tests")
    @Operation(summary = "Get available tests", description = "List all available career assessment tests")
    public ResponseEntity<List<Test>> getAvailableTests() {
        try {
            List<Test> tests = testService.getAllTests();
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            log.error("Error fetching tests", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tests/{testId}")
    @Operation(summary = "Get test by ID", description = "Get specific test with all questions")
    public ResponseEntity<Test> getTest(@PathVariable String testId) {
        try {
            Test test = testService.getTestById(testId);
            if (test == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            log.error("Error fetching test: {}", testId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/tests/{testId}/submit")
    @Operation(summary = "Submit test answers", 
               description = "Submit completed test answers and receive career report",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> submitTest(
            @PathVariable String testId,
            @Valid @RequestBody TestSubmissionDTO submission,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            User user = userService.findById(userId);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            log.info("Processing test submission for user: {} test: {}", user.getEmail(), testId);
            
            // Set user information in submission
            submission.setUserId(user.getId());
            submission.setUserName(user.getName());
            
            // Handle combined test submission (both vibematch and edustats)
            if ("combined".equals(testId)) {
                // For combined submission, we don't need to validate a specific test
                // The scoring service will process both test results
                log.info("Processing combined test submission for user: {}", user.getEmail());
            } else {
                // Validate individual test exists
                Test test = testService.getTestById(testId);
                if (test == null) {
                    return ResponseEntity.badRequest().body("Test not found");
                }
            }
            
            // Compute career report using scoring service
            StudentReport report = scoringService.computeCareerReport(submission);
            
            // Save report to database
            Report savedReport = reportService.saveReport(report, user.getId());
            
            // Send email with PDF report
            try {
                emailService.sendReportEmail(report, user.getEmail(), user.getName());
                log.info("Email sent successfully to: {} for student: {}", user.getEmail(), user.getName());
            } catch (Exception e) {
                log.error("Failed to send email to: {} for student: {}", user.getEmail(), user.getName(), e);
                // Don't fail the entire request if email fails
            }
            
            // Note: Progress is kept for user retake capability and completion tracking
            // Progress is only cleared when user explicitly starts a new test
            
            log.info("Test submitted successfully. Report ID: {}", savedReport.getId());
            
            return ResponseEntity.ok(Map.of(
                "reportId", savedReport.getId(),
                "report", report, // Include the full report object
                "message", "Test submitted successfully, Report generation started successfully."
            ));
            
        } catch (Exception e) {
            log.error("Error submitting test: {}", testId, e);
            return ResponseEntity.internalServerError()
                .body("Error processing test submission: " + e.getMessage());
        }
    }

    @GetMapping("/progress/{userId}")
    @Operation(summary = "Get user progress", 
               description = "Get saved test progress for a user",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getUserProgress(
            @PathVariable String userId,
            @RequestParam(required = false) String testId,
            Authentication authentication) {
        try {
            String authenticatedUserId = authentication.getName();
            User user = userService.findById(authenticatedUserId);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            if (testId != null) {
                TestProgress progress = progressService.getProgress(user.getId(), testId);
                return ResponseEntity.ok(progress);
            } else {
                List<TestProgress> allProgress = progressService.getAllProgressForUser(user.getId());
                return ResponseEntity.ok(allProgress);
            }
            
        } catch (Exception e) {
            log.error("Error fetching progress for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                .body("Error fetching progress");
        }
    }

    @PostMapping("/progress/save")
    @Operation(summary = "Save test progress", 
               description = "Save current test progress",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> saveProgress(
            @Valid @RequestBody TestProgress progress,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            User user = userService.findById(userId);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Set user ID from authenticated user
            progress.setUserId(user.getId());
            
            TestProgress savedProgress = progressService.saveProgress(progress);
            
            return ResponseEntity.ok(Map.of(
                "progress", savedProgress,
                "message", "Progress saved successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error saving progress", e);
            return ResponseEntity.internalServerError()
                .body("Error saving progress: " + e.getMessage());
        }
    }

    @PostMapping("/progress/reset")
    @Operation(summary = "Reset test progress", 
               description = "Reset/clear test progress for user",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> resetProgress(
            @RequestParam String testId,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            User user = userService.findById(userId);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            progressService.resetProgress(user.getId(), testId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Progress reset successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error resetting progress", e);
            return ResponseEntity.internalServerError()
                .body("Error resetting progress: " + e.getMessage());
        }
    }

    @PostMapping("/progress/cleanup")
    @Operation(summary = "Cleanup duplicate progress", 
               description = "Remove duplicate progress entries for user, keeping only the most recent",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> cleanupDuplicateProgress(Authentication authentication) {
        try {
            String userId = authentication.getName();
            User user = userService.findById(userId);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            progressService.cleanupDuplicateProgress(user.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Duplicate progress entries cleaned up successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error cleaning up duplicate progress", e);
            return ResponseEntity.internalServerError()
                .body("Error cleaning up duplicate progress: " + e.getMessage());
        }
    }
}