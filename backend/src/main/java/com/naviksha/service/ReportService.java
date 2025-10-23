package com.naviksha.service;

import com.naviksha.model.Report;
import com.naviksha.model.StudentReport;
import com.naviksha.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final ReportRepository reportRepository;
    
    public Report saveReport(StudentReport reportData, String userId) {
        Report report = Report.builder()
            .userId(userId)
            .reportData(reportData)
            .build();
        
        return reportRepository.save(report);
    }
    
    public Report getReport(String reportId) {
        return reportRepository.findById(reportId).orElse(null);
    }
    
    public List<Report> getUserReports(String userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}