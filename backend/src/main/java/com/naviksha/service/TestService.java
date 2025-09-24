package com.naviksha.service;

import com.naviksha.model.Test;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestService {
    
    private final ObjectMapper objectMapper;
    
    public List<Test> getAllTests() {
        return Arrays.asList(
            createVibeMatchTest(),
            createEduStatsTest()
        );
    }
    
    public Test getTestById(String testId) {
        return switch (testId) {
            case "vibematch" -> createVibeMatchTest();
            case "edustats" -> createEduStatsTest();
            default -> null;
        };
    }
    
    private Test createVibeMatchTest() {
        try {
            ClassPathResource resource = new ClassPathResource("data/vibematch_questions.json");
            List<Map<String, Object>> questionsData = objectMapper.readValue(
                resource.getInputStream(), 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            List<Test.Question> questions = questionsData.stream()
                .map(this::mapToQuestion)
                .toList();
            
            return Test.builder()
                .testId("vibematch")
                .name("Vibe Match Assessment")
                .description("Personality and interest assessment based on RIASEC model")
                .type("vibematch")
                .questions(questions)
                .build();
        } catch (Exception e) {
            log.error("Error loading vibematch questions", e);
            return Test.builder()
                .testId("vibematch")
                .name("Vibe Match Assessment")
                .questions(List.of())
                .build();
        }
    }
    
    private Test createEduStatsTest() {
        try {
            ClassPathResource resource = new ClassPathResource("data/edustats_questions.json");
            List<Map<String, Object>> questionsData = objectMapper.readValue(
                resource.getInputStream(), 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            List<Test.Question> questions = questionsData.stream()
                .map(this::mapToQuestion)
                .toList();
            
            return Test.builder()
                .testId("edustats")
                .name("Educational Background Assessment")
                .description("Academic performance and educational preferences assessment")
                .type("edustats")
                .questions(questions)
                .build();
        } catch (Exception e) {
            log.error("Error loading edustats questions", e);
            return Test.builder()
                .testId("edustats")
                .name("Educational Background Assessment")
                .questions(List.of())
                .build();
        }
    }
    
    @SuppressWarnings("unchecked")
    private Test.Question mapToQuestion(Map<String, Object> data) {
        return Test.Question.builder()
            .id((String) data.get("id"))
            .text((String) data.get("text"))
            .type((String) data.get("type"))
            .required((Boolean) data.getOrDefault("required", false))
            .options((List<String>) data.get("options"))
            .instruction((String) data.get("instruction"))
            .riasecMap((Map<String, Integer>) data.get("riasec_map"))
            .build();
    }
}