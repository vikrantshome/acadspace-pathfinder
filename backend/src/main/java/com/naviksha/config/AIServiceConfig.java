package com.naviksha.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI Service Configuration
 * 
 * Configuration properties for the AI report generation microservice
 */
@Configuration
@ConfigurationProperties(prefix = "ai.service")
@Data
public class AIServiceConfig {
    
    /**
     * AI service base URL
     * Default: http://localhost:8000
     */
    private String url = "http://localhost:8000";
    
    /**
     * Request timeout in milliseconds
     * Default: 300000 (300 seconds / 5 minutes) - AI generation can take time for multiple careers
     */
    private int timeout = 300000;
    
    /**
     * Whether AI service is enabled
     * Default: true
     */
    private boolean enabled = true;
    
    /**
     * Get the full URL for the generate report endpoint
     */
    public String getGenerateReportUrl() {
        return url + "/api/v1/generate-report-java";
    }
    
    /**
     * Get the health check URL
     */
    public String getHealthCheckUrl() {
        return url + "/api/v1/health";
    }
}
