package com.naviksha.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    
    private String userId;
    private StudentReport reportData;
    private String reportLink;
    @Builder.Default
    private boolean pdfGenerated = false;
    private String pdfGenerationError;
    
    @CreatedDate
    private LocalDateTime createdAt;
}