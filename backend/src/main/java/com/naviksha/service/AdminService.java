package com.naviksha.service;

import com.naviksha.model.AdminAudit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final CareerService careerService;
    
    public void logAction(String adminUser, String action, String details) {
        log.info("Admin action - User: {}, Action: {}, Details: {}", adminUser, action, details);
    }
    
    public List<AdminAudit> getAuditLogs(int page, int size) {
        // Implementation would typically query audit log collection
        return List.of();
    }
    
    public Map<String, Object> getSystemStats() {
        long careerCount = careerService.getAllCareers().size();
        
        return Map.of(
            "totalCareers", careerCount,
            "totalTests", 2,
            "systemStatus", "operational"
        );
    }
}