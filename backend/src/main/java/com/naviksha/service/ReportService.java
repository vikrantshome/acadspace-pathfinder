package com.naviksha.service;

import com.naviksha.dto.PuppeteerRequest;
import com.naviksha.dto.PuppeteerResponse;
import com.naviksha.model.Report;
import com.naviksha.model.StudentReport;
import com.naviksha.model.User;
import com.naviksha.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserService userService;
    private final WebClient.Builder webClientBuilder;

    @Value("${puppeteer.ms.url}")
    private String puppeteerServiceUrl;

    public Report saveReport(StudentReport reportData, String userId) {
        Report report = Report.builder()
                .userId(userId)
                .reportData(reportData)
                .build();
        
        Report savedReport = reportRepository.save(report);

        // Asynchronously generate PDF and get the link
        generatePdfAndSaveLink(savedReport);

        return savedReport;
    }

    private void generatePdfAndSaveLink(Report report) {
        User user = userService.findById(report.getUserId());
        if (user == null) {
            // Or handle this case more gracefully
            return;
        }

        PuppeteerRequest puppeteerRequest = new PuppeteerRequest(
                report.getReportData(),
                user.getId(),
                user.getMobileNo(),
                user.getStudentID(),
                user.getName()
        );

        webClientBuilder.build()
                .post()
                .uri(puppeteerServiceUrl + "/generate-pdf")
                .body(Mono.just(puppeteerRequest), PuppeteerRequest.class)
                .retrieve()
                .bodyToMono(PuppeteerResponse.class)
                .subscribe(response -> {
                    report.setReportLink(response.getReportLink());
                    reportRepository.save(report);
                });
    }

    public Report getReport(String reportId) {
        return reportRepository.findById(reportId).orElse(null);
    }

    public List<Report> getUserReports(String userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}