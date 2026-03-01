package com.naviksha.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryDTO {
    // User Context
    private String studentID;
    private String studentName;
    private String mobileNo;
    private String email;
    private String city;
    private String state;
    private String schoolName;
    private Boolean active;
    private String fullName;
    private String parentName;
    
    // Academic Context
    private Integer grade;
    private String board;
    private String partner;
    
    // Extracurricular / Parent
    private String extracurriculars;
    private String parentCareers;

    // Career Matches
    private String topBucket1;
    private String topBucket2;
    private String topBucket3;
    private String topCareer1;
    private String topCareer2;
    private String topCareer3;
    
    // Vibe Scores (Flattened to help frontend pivot)
    private Integer vibeR;
    private Integer vibeI;
    private Integer vibeA;
    private Integer vibeS;
    private Integer vibeE;
    private Integer vibeC;
    
    // EduStats (Flattened generic map)
    private Map<String, Integer> eduStats;

    // AI Status
    private Boolean aiEnhanced;
    
    // System Data
    private String createdAt;
    private String updatedAt;
}
