package com.naviksha.service;

import com.naviksha.model.Career;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class SubjectivityAnalysisService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private Map<String, List<String>> keywords;
    
    public SubjectivityAnalysisService() {
        loadKeywords();
    }
    
    @SuppressWarnings("unchecked")
    private void loadKeywords() {
        try {
            ClassPathResource resource = new ClassPathResource("data/subjectivity_keywords.json");
            keywords = objectMapper.readValue(resource.getInputStream(), Map.class);
        } catch (Exception e) {
            log.error("Error loading subjectivity keywords", e);
            keywords = Map.of();
        }
    }
    
    public double analyzeTextAlignment(String text, Career career) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }
        
        String lowerText = text.toLowerCase();
        double score = 0.0;
        int matchCount = 0;
        
        // Check against career tags and keywords
        String tags = career.getTags();
        if (tags != null) {
            String[] careerTags = tags.replaceAll("[\\[\\]\"]", "").split(",");
            for (String tag : careerTags) {
                String cleanTag = tag.trim().toLowerCase();
                List<String> relatedKeywords = keywords.get(cleanTag);
                
                if (relatedKeywords != null) {
                    for (String keyword : relatedKeywords) {
                        if (lowerText.contains(keyword.toLowerCase())) {
                            score += 10.0;
                            matchCount++;
                        }
                    }
                }
            }
        }
        
        return Math.min(100.0, score);
    }
}