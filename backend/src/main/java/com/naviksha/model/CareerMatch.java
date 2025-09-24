package com.naviksha.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerMatch {
    private String careerName;
    private Integer matchScore;
    private List<String> topReasons;
    private List<String> studyPath;
    private List<String> first3Steps;
    private String confidence;
    private String whatWouldChangeRecommendation;
}