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
    private final PdfGenerationService pdfGenerationService; // Injected new service

    public Report saveReport(StudentReport reportData, String userId) {
        Report report = Report.builder()
                .userId(userId)
                .reportData(reportData)
                .build();
        
        Report savedReport = reportRepository.save(report);

        // Asynchronously generate PDF via the new dedicated service
        pdfGenerationService.generatePdfAndSaveLink(savedReport);

        return savedReport;
    }

    public Report getReport(String reportId) {
        return reportRepository.findById(reportId).orElse(null);
    }

    public List<Report> getUserReports(String userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Report getLatestReportByUserId(String userId) {
        List<Report> reports = reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (reports.isEmpty()) {
            return null;
        }
        return reports.get(0);
    }


    public Report save(Report report) {
        return reportRepository.save(report);
    }

    public String getReportLink(String reportId) throws InterruptedException {
        Report report = reportRepository.findById(reportId).orElse(null);
        if (report == null) {
            return null;
        }

        if (report.getReportLink() != null && !report.getReportLink().isEmpty()) {
            return report.getReportLink();
        }

        // Retry logic
        for (int i = 0; i < 15; i++) {
            Thread.sleep(1000);
            report = reportRepository.findById(reportId).orElse(null);
            if (report != null && report.getReportLink() != null && !report.getReportLink().isEmpty()) {
                return report.getReportLink();
            }
        }

        // If still no link, generate it
        pdfGenerationService.generatePdfAndSaveLink(report);
        // It might take a moment to save, so we fetch it again
        Report updatedReport = reportRepository.findById(reportId).orElse(null);
        return updatedReport != null ? updatedReport.getReportLink() : null;
    }

}