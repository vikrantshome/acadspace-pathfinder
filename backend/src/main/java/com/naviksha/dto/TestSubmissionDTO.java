package com.naviksha.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class TestSubmissionDTO {
    private String userId;
    
    @NotBlank(message = "User name is required")
    private String userName;
    
    @NotNull(message = "Grade is required")
    private Integer grade;
    
    @NotBlank(message = "Board is required")
    private String board;
    
    @NotNull(message = "Answers are required")
    private Map<String, Object> answers;
    
    private Map<String, Integer> subjectScores;
    private List<String> extracurriculars;
    private List<String> parentCareers;
    private Boolean studyAbroadPreference;
    private String workStylePreference;
}