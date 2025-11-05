package com.naviksha.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentReport {
    private String studentName;
    private Integer grade;
    private String board;
    private Map<String, Integer> vibeScores;
    private Map<String, Integer> eduStats;
    private List<String> extracurriculars;
    private List<String> parents;
    private List<CareerBucket> top5Buckets;
    private String summaryParagraph;
    
    // AI Enhancement Fields
    private Boolean aiEnhanced;
    private String enhancedSummary;
    private List<String> skillRecommendations; // Focused skill names
    private List<Map<String, String>> detailedSkillRecommendations; // For grade < 8: [{skill_name, explanation}]
    private String careerTrajectoryInsights;
    private Map<String, Object> detailedCareerInsights;
    private List<Map<String, String>> actionPlan; // Action plan items: [{title, desc, timeline}]
}