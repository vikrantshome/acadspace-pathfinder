package com.naviksha.service;

import com.naviksha.dto.PdfServiceRequest;
import com.naviksha.model.Report;
import com.naviksha.model.StudentReport;
import com.naviksha.model.User;
import com.naviksha.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserService userService;
    private final WebClient.Builder webClientBuilder;

    @Value("${pdf.service.url}")
    private String pdfServiceUrl;

    @Value("${pdf.service.timeout:60000}")
    private long pdfServiceTimeout;

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
            log.error("User not found for report ID: {}", report.getId());
            return;
        }

        log.info("Generating PDF for student: {} (ID: {})", user.getName(), user.getStudentID());

        // Create PDF service request with student data
        PdfServiceRequest pdfRequest = new PdfServiceRequest(
                report.getReportData(),
                user.getId(),
                user.getMobileNo(),
                user.getStudentID(),
                user.getName()
        );

        // Call PDF service asynchronously
        webClientBuilder.build()
                .post()
                .uri(pdfServiceUrl + "/generate-pdf")
                .bodyValue(pdfRequest)
                .retrieve()
                .bodyToMono(byte[].class)
                .timeout(Duration.ofMillis(pdfServiceTimeout))
                .subscribe(
                    pdfBuffer -> {
                        log.info("PDF generated successfully for student: {}", user.getName());
                        // Mark PDF as generated in report
                        report.setPdfGenerated(true);
                        reportRepository.save(report);
                    },
                    error -> {
                        log.error("Error generating PDF for student: {}", user.getName(), error);
                        report.setPdfGenerated(false);
                        reportRepository.save(report);
                    }
                );
    }

    public Report getReport(String reportId) {
        return reportRepository.findById(reportId).orElse(null);
    }

    public List<Report> getUserReports(String userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}