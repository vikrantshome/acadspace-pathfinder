package com.naviksha.service;

import com.naviksha.dto.PuppeteerRequest;
import com.naviksha.dto.PuppeteerResponse;
import com.naviksha.model.Report;
import com.naviksha.model.User;
import com.naviksha.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfGenerationService {

    private final ReportRepository reportRepository;
    private final UserService userService;
    private final WebClient.Builder webClientBuilder;

    @Value("${puppeteer.ms.url}")
    private String puppeteerServiceUrl;

    @Async
    public void generatePdfAndSaveLinkAsync(Report report) {
        log.info("Asynchronously generating PDF for report ID: {}", report.getId());
        generatePdfAndSaveLinkSync(report);
    }

    public Report generatePdfAndSaveLinkSync(Report report) {
        log.info("Synchronously generating PDF for report ID: {}", report.getId());
        User user = userService.findById(report.getUserId());
        if (user == null) {
            log.error("Cannot generate PDF. User not found for report ID: {}", report.getId());
            return report; // Return original report, link not generated
        }

        PuppeteerRequest puppeteerRequest = new PuppeteerRequest(
                report.getReportData(),
                user.getId(),
                user.getMobileNo(),
                user.getStudentID(),
                user.getName()
        );

        log.info("Sending PDF generation request to: {}/generate-pdf", puppeteerServiceUrl);

        try {
            PuppeteerResponse response = webClientBuilder.build()
                    .post()
                    .uri(puppeteerServiceUrl + "/generate-pdf")
                    .bodyValue(puppeteerRequest)
                    .retrieve()
                    .bodyToMono(PuppeteerResponse.class)
                    .block();

            if (response != null && response.getReportLink() != null) {
                report.setReportLink(response.getReportLink());
                Report updatedReport = reportRepository.save(report);
                log.info("Successfully generated and saved PDF link for report ID: {}", report.getId());
                return updatedReport;
            } else {
                log.error("Failed to get a valid response or report link from Puppeteer service for report ID: {}", report.getId());
                return report; // Return original report, link not generated
            }
        } catch (Exception e) {
            log.error("Error during PDF generation for report ID: {}. URL: {}", report.getId(), puppeteerServiceUrl, e);
            e.printStackTrace(); // Force stack trace to stdout
            return report; // Return original report, link not generated
        }
    }
}
