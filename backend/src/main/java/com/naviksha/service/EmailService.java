package com.naviksha.service;

import com.naviksha.model.StudentReport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final PDFServiceClient pdfServiceClient;
    
    @Value("${email.enabled:true}")
    private boolean emailEnabled;
    
    @Value("${email.from}")
    private String fromEmail;
    
    @Value("${email.from-name}")
    private String fromName;
    
    /**
     * Send career report PDF via email
     * Non-blocking: Email failures are logged but don't throw exceptions to avoid blocking report generation
     * 
     * @param studentReport The generated student report
     * @param recipientEmail The email address to send the report to
     * @param studentName The name of the student
     */
    public void sendReportEmail(StudentReport studentReport, String recipientEmail, String studentName) {
        if (!emailEnabled) {
            log.info("Email service is disabled, skipping email send for student: {}", studentName);
            return;
        }
        
        try {
            log.info("Sending career report email to: {} for student: {}", recipientEmail, studentName);
            
            // Generate PDF using Node.js service (same logic as frontend)
            byte[] pdfBytes = pdfServiceClient.generatePDF(studentReport);
            
            // Create email message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set email details
            helper.setFrom(fromEmail, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject("Your Career Assessment Report - " + studentName);
            
            // Prepare template context
            Context context = new Context();
            context.setVariable("studentName", studentName);
            context.setVariable("reportDate", java.time.LocalDate.now());
            context.setVariable("topCareers", studentReport.getTop5Buckets().stream()
                .limit(3)
                .map(bucket -> bucket.getTopCareers().get(0).getCareerName())
                .toList());
            
            // Generate HTML content from template
            String htmlContent = templateEngine.process("email/report-template", context);
            helper.setText(htmlContent, true);
            
            // Attach PDF
            ByteArrayResource pdfResource = new ByteArrayResource(pdfBytes);
            helper.addAttachment("Career_Report_" + studentName.replaceAll("\\s+", "_") + ".pdf", pdfResource);
            
            // Send email (will timeout quickly if connection fails - 5-15 seconds)
            mailSender.send(message);
            
            log.info("Successfully sent career report email to: {} for student: {}", recipientEmail, studentName);
            
        } catch (jakarta.mail.MessagingException e) {
            // Check if it's a connection error - fail fast and log
            String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (errorMsg.contains("couldn't connect") || errorMsg.contains("connection") || 
                errorMsg.contains("timeout") || errorMsg.contains("unreachable")) {
                log.warn("Email connection failed (skipping email) for {} - {}: {}", 
                    recipientEmail, studentName, e.getMessage());
            } else {
                log.error("Email sending failed for {} - {}: {}", recipientEmail, studentName, e.getMessage(), e);
            }
            // Don't throw - email is non-blocking, report generation continues
            
        } catch (Exception e) {
            // Catch all other exceptions (including timeout exceptions)
            String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (errorMsg.contains("timeout") || errorMsg.contains("connection")) {
                log.warn("Email timeout/connection error (skipping email) for {} - {}: {}", 
                    recipientEmail, studentName, e.getMessage());
            } else {
                log.error("Unexpected error sending email to {} - {}: {}", 
                    recipientEmail, studentName, e.getMessage(), e);
            }
            // Don't throw - email is non-blocking, report generation continues
        }
    }
    
    /**
     * Send a simple notification email without PDF attachment
     * 
     * @param recipientEmail The email address to send to
     * @param subject The email subject
     * @param templateName The Thymeleaf template name
     * @param contextVariables Variables for the template
     */
    public void sendNotificationEmail(String recipientEmail, String subject, String templateName, Map<String, Object> contextVariables) {
        if (!emailEnabled) {
            log.info("Email service is disabled, skipping notification email to: {}", recipientEmail);
            return;
        }
        
        try {
            log.info("Sending notification email to: {} with subject: {}", recipientEmail, subject);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            
            // Prepare template context
            Context context = new Context();
            contextVariables.forEach(context::setVariable);
            
            // Generate HTML content from template
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);
            
            // Send email
            mailSender.send(message);
            
            log.info("Successfully sent notification email to: {}", recipientEmail);
            
        } catch (jakarta.mail.MessagingException e) {
            // Check if it's a connection error - fail fast and log
            String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (errorMsg.contains("couldn't connect") || errorMsg.contains("connection") || 
                errorMsg.contains("timeout") || errorMsg.contains("unreachable")) {
                log.warn("Email connection failed (skipping email) for {}: {}", recipientEmail, e.getMessage());
            } else {
                log.error("Email sending failed for {}: {}", recipientEmail, e.getMessage(), e);
            }
            // Don't throw - email is non-blocking
            
        } catch (Exception e) {
            // Catch all other exceptions (including timeout exceptions)
            String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (errorMsg.contains("timeout") || errorMsg.contains("connection")) {
                log.warn("Email timeout/connection error (skipping email) for {}: {}", recipientEmail, e.getMessage());
            } else {
                log.error("Unexpected error sending email to {}: {}", recipientEmail, e.getMessage(), e);
            }
            // Don't throw - email is non-blocking
        }
    }
}