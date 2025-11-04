package com.naviksha.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.naviksha.config.AIServiceConfig;
import com.naviksha.model.StudentReport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.Map;
import java.util.List;

/**
 * AI Service Client
 * 
 * Handles communication with the AI report generation microservice
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceClient {
    
    private final AIServiceConfig aiServiceConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * Call AI service to enhance the student report
     * 
     * @param studentReport Original student report from scoring service
     * @return Enhanced student report with AI-generated content
     */
    public StudentReport enhanceReport(StudentReport studentReport) {
        if (!aiServiceConfig.isEnabled()) {
            log.info("AI service is disabled, returning original report");
            return studentReport;
        }
        
        try {
            log.info("Calling AI service to enhance report for student: {}", studentReport.getStudentName());
            
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create request entity
            HttpEntity<StudentReport> requestEntity = new HttpEntity<>(studentReport, headers);
            
            // Call AI service
            ResponseEntity<Map> response = restTemplate.exchange(
                aiServiceConfig.getGenerateReportUrl(),
                HttpMethod.POST,
                requestEntity,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully received AI-enhanced report");
                
                // Convert AI service response directly to StudentReport
                Map<String, Object> responseBody = response.getBody();
                return convertToStudentReport(responseBody);
                
            } else {
                log.warn("AI service returned unexpected status: {}", response.getStatusCode());
                return studentReport;
            }
            
        } catch (HttpClientErrorException e) {
            log.error("AI service client error (4xx): {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return studentReport;
            
        } catch (HttpServerErrorException e) {
            log.error("AI service server error (5xx): {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return studentReport;
            
        } catch (ResourceAccessException e) {
            log.error("AI service connection timeout or unavailable: {}", e.getMessage());
            return studentReport;
            
        } catch (Exception e) {
            log.error("Unexpected error calling AI service: {}", e.getMessage(), e);
            return studentReport;
        }
    }
    
    /**
     * Check if AI service is healthy
     * 
     * @return true if AI service is available, false otherwise
     */
    public boolean isHealthy() {
        if (!aiServiceConfig.isEnabled()) {
            return false;
        }
        
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                aiServiceConfig.getHealthCheckUrl(),
                Map.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.debug("AI service health check failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Convert AI service response back to StudentReport
     * 
     * @param responseBody AI service response body
     * @return StudentReport object
     */
    private StudentReport convertToStudentReport(Map<String, Object> responseBody) {
        try {
            // Convert the response map back to StudentReport
            return objectMapper.convertValue(responseBody, StudentReport.class);
            
        } catch (Exception e) {
            log.error("Error converting AI service response to StudentReport: {}", e.getMessage());
            throw new RuntimeException("Failed to convert AI service response", e);
        }
    }
    
    /**
     * Merge AI enhancements with original StudentReport
     * 
     * @param originalReport Original report from scoring service
     * @param aiResponse AI service response
     * @return Enhanced StudentReport with AI content
     */
    private StudentReport mergeAIEnhancements(StudentReport originalReport, Map<String, Object> aiResponse) {
        try {
            // Create a new report with AI enhancements
            return StudentReport.builder()
                .studentName(originalReport.getStudentName())
                .grade(originalReport.getGrade())
                .board(originalReport.getBoard())
                .vibeScores(originalReport.getVibeScores())
                .eduStats(originalReport.getEduStats())
                .extracurriculars(originalReport.getExtracurriculars())
                .parents(originalReport.getParents())
                .top5Buckets(originalReport.getTop5Buckets())
                .summaryParagraph(originalReport.getSummaryParagraph())
                // AI Enhancement fields
                .aiEnhanced((Boolean) aiResponse.get("aiEnhanced"))
                .enhancedSummary((String) aiResponse.get("enhancedSummary"))
                .skillRecommendations((List<String>) aiResponse.get("skillRecommendations"))
                .detailedSkillRecommendations((List<Map<String, String>>) aiResponse.get("detailedSkillRecommendations"))
                .careerTrajectoryInsights((String) aiResponse.get("careerTrajectoryInsights"))
                .detailedCareerInsights((Map<String, Object>) aiResponse.get("detailedCareerInsights"))
                .build();
                
        } catch (Exception e) {
            log.error("Error merging AI enhancements: {}", e.getMessage());
            return originalReport;
        }
    }
}
