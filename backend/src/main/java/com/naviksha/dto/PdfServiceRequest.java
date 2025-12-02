package com.naviksha.dto;

import com.naviksha.model.StudentReport;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for PDF Service
 * Sends student report data to PDF generation service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PdfServiceRequest {
    private StudentReport reportData;
    private String studentId;
    private String mobileNo;
    private String studentIdentifier;
    private String studentName;
}
