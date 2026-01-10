package com.naviksha.service;

import com.naviksha.model.Career;
import com.naviksha.model.StudentReport;
import com.naviksha.model.CareerBucket;
import com.naviksha.model.CareerMatch;
import com.naviksha.dto.TestSubmissionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Scoring Service - The Core Career Matching Engine
 * 
 * SCORING FORMULA BREAKDOWN:
 * Final Score = (RIASEC Match * 40%) + (Subject Match * 30%) + (Practical Fit * 20%) + (Context Fit * 10%)
 * 
 * 1. RIASEC Match (40%): Compares user's personality profile with career's RIASEC requirements
 * 2. Subject Match (30%): Compares academic performance in relevant subjects
 * 3. Practical Fit (20%): Analyzes extracurriculars and subjective responses using keyword matching
 * 4. Context Fit (10%): Considers family background and social factors
 * 
 * HOW TO EDIT/CUSTOMIZE:
 * - Adjust weights in computeFinalScore() method
 * - Modify RIASEC scoring logic in riasecMatchScore()
 * - Update subject importance in subjectMatchScore()
 * - Add new keywords in practicalFitScore() using subjectivity analysis
 * - Customize family influence in contextFitScore()
 */
@Service
@Slf4j
public class ScoringService {
    
    @Autowired
    private AIServiceClient aiServiceClient;

    @Autowired
    private CareerService careerService;

    @Autowired
    private SubjectivityAnalysisService subjectivityService;

    // Scoring weights - adjust these to fine-tune matching algorithm
    private static final double RIASEC_WEIGHT = 0.40;
    private static final double SUBJECT_WEIGHT = 0.30;
    private static final double PRACTICAL_WEIGHT = 0.20;
    private static final double CONTEXT_WEIGHT = 0.10;

    /**
     * Main method to compute complete career report for a user
     * 
     * @param submission User's test answers and profile data
     * @return Complete StudentReport with rankings and recommendations
     */
    public StudentReport computeCareerReport(TestSubmissionDTO submission) {
        log.info("Computing career report for user: {}", submission.getUserName());
        
        // Get all careers for scoring
        List<Career> allCareers = careerService.getAllCareers();
        
        // Calculate RIASEC scores from vibematch answers
        Map<String, Integer> riasecScores = calculateRiasecScores(submission.getAnswers());
        
        // Score each career against user profile
        List<CareerMatch> careerMatches = new ArrayList<>();
        for (Career career : allCareers) {
            double score = computeFinalScore(career, submission, riasecScores);
            List<String> reasons = generateTopReasons(career, submission, riasecScores);
            
            CareerMatch match = CareerMatch.builder()
                .careerName(career.getCareerName())
                .matchScore((int) Math.round(score))
                .topReasons(reasons)
                .studyPath(parseStudyPath(career.getTop5CollegeCourses()))
                .first3Steps(generateFirst3Steps(career))
                .confidence(determineConfidence(score, submission))
                .whatWouldChangeRecommendation(generateChangeRecommendation(career, submission))
                .build();
            
            careerMatches.add(match);
        }
        
        // Sort by match score descending
        careerMatches.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        
        // Group into buckets and get top 5
        List<CareerBucket> topBuckets = groupIntoBuckets(careerMatches);
        
        // Extract partner from answers if present
        String partner = null;
        if (submission.getAnswers().containsKey("partner")) {
            partner = String.valueOf(submission.getAnswers().get("partner"));
        }

        // Build final report
        StudentReport report = StudentReport.builder()
            .studentName(submission.getUserName())
            .schoolName(submission.getSchoolName())
            .grade(submission.getGrade())
            .board(submission.getBoard())
            .vibeScores(riasecScores)
            .eduStats(submission.getSubjectScores())
            .extracurriculars(submission.getExtracurriculars())
            .parents(submission.getParentCareers())
            .top5Buckets(topBuckets.subList(0, Math.min(5, topBuckets.size())))
            .summaryParagraph(generateSummaryParagraph(submission, topBuckets))
            .partner(partner)
            .build();
        
        // Enhance report with AI service
        try {
            log.info("Enhancing report with AI service for student: {}", submission.getUserName());
            StudentReport enhancedReport = aiServiceClient.enhanceReport(report);
            log.info("Successfully enhanced report with AI service");
            return enhancedReport;
        } catch (Exception e) {
            log.error("Failed to enhance report with AI service, returning original report: {}", e.getMessage());
            return report;
        }
    }

    /**
     * Calculate RIASEC personality scores from vibematch test answers
     * 
     * RIASEC Categories:
     * R = Realistic (hands-on, practical)
     * I = Investigative (analytical, research)  
     * A = Artistic (creative, expressive)
     * S = Social (helping, teaching)
     * E = Enterprising (leading, persuading)
     * C = Conventional (organizing, detail-oriented)
     */
    private Map<String, Integer> calculateRiasecScores(Map<String, Object> answers) {
        Map<String, Double> totalScores = new HashMap<>();
        Map<String, Integer> questionCounts = new HashMap<>();
        
        // Initialize maps
        for (String cat : Arrays.asList("R", "I", "A", "S", "E", "C")) {
            totalScores.put(cat, 0.0);
            questionCounts.put(cat, 0);
        }

        // Default missing vibematch answers to 3 (Neutral).
        for (int i = 1; i <= 14; i++) {
            String questionKey = String.format("v_%02d", i);
            answers.putIfAbsent(questionKey, 3);
        }
        
        // Process each vibematch answer (Likert scale 1-5)
        for (Map.Entry<String, Object> answer : answers.entrySet()) {
            String questionId = answer.getKey();
            if (questionId.startsWith("v_") && answer.getValue() instanceof Number) {
                int score = ((Number) answer.getValue()).intValue();
                
                String qNumStr = questionId.substring(2);
                try {
                    int qNum = Integer.parseInt(qNumStr);
                    Map<String, Integer> riasecMap = getQuestionRiasecMapping(qNum);
                    for (Map.Entry<String, Integer> mapping : riasecMap.entrySet()) {
                        String category = mapping.getKey();
                        // Add score to category total (weighted by mapping value, usually 1)
                        totalScores.merge(category, (double) score * mapping.getValue(), Double::sum);
                        // Increment question count for this category
                        questionCounts.merge(category, 1, Integer::sum);
                    }
                } catch (NumberFormatException e) {
                    log.warn("Invalid question number format in RIASEC answer: {}", questionId);
                }
            }
        }
        
        // Calculate averages and then normalize to percentages
        Map<String, Integer> finalScores = new HashMap<>();
        double sumOfAverages = 0.0;
        
        // First pass: Calculate averages
        Map<String, Double> averages = new HashMap<>();
        for (String cat : totalScores.keySet()) {
            int count = questionCounts.get(cat);
            double avg = count > 0 ? totalScores.get(cat) / count : 0.0;
            averages.put(cat, avg);
            sumOfAverages += avg;
        }
        
        // Second pass: Normalize to percentage distribution (0-100)
        if (sumOfAverages > 0) {
            for (Map.Entry<String, Double> entry : averages.entrySet()) {
                finalScores.put(entry.getKey(), (int) Math.round((entry.getValue() * 100.0) / sumOfAverages));
            }
        } else {
            // Fallback if no scores
            finalScores.putAll(Map.of("R", 0, "I", 0, "A", 0, "S", 0, "E", 0, "C", 0));
        }
        
        return finalScores;
    }

    /**
     * Get RIASEC mapping for a specific question based on vibematch_questions.json structure
     * Updated to take an integer question number
     */
    private Map<String, Integer> getQuestionRiasecMapping(int qNum) { // Changed to int qNum
        Map<String, Integer> mapping = new HashMap<>();
        
        // Based on vibematch_questions.json riasec_map field
        switch (qNum) { // Changed to qNum
            case 1, 8 -> mapping.put("R", 1);
            case 2, 7, 11 -> mapping.put("C", 1);
            case 3, 9, 14 -> mapping.put("I", 1);
            case 4, 12 -> mapping.put("S", 1);
            case 5, 10 -> mapping.put("A", 1);
            case 6, 13 -> mapping.put("E", 1);
        }
        
        return mapping;
    }

    /**
     * Compute final weighted score for a career
     * 
     * SCORING BREAKDOWN:
     * - RIASEC Match: 40% (personality fit)
     * - Subject Match: 30% (academic preparedness)
     * - Practical Fit: 20% (experience and interests)
     * - Context Fit: 10% (family and social factors)
     */
    public double computeFinalScore(Career career, TestSubmissionDTO submission, Map<String, Integer> riasecScores) {
        double riasecScore = riasecMatchScore(career, riasecScores);
        double subjectScore = subjectMatchScore(career, submission);
        double practicalScore = practicalFitScore(career, submission);
        double contextScore = contextFitScore(career, submission);
        
        double finalScore = (riasecScore * RIASEC_WEIGHT) + 
                           (subjectScore * SUBJECT_WEIGHT) + 
                           (practicalScore * PRACTICAL_WEIGHT) + 
                           (contextScore * CONTEXT_WEIGHT);
        
        log.debug("Career: {} | RIASEC: {:.1f} | Subject: {:.1f} | Practical: {:.1f} | Context: {:.1f} | Final: {:.1f}",
                career.getCareerName(), riasecScore, subjectScore, practicalScore, contextScore, finalScore);
        
        return Math.max(0, Math.min(100, finalScore)); // Clamp to 0-100 range
    }

    /**
     * Calculate RIASEC personality match score (0-100)
     * Compares user's RIASEC profile with career's required profile
     */
    public double riasecMatchScore(Career career, Map<String, Integer> userRiasecScores) {
        Map<String, Integer> careerRiasec = parseRiasecProfile(career.getRiasecProfile());
        
        double totalMatch = 0.0;
        int profileLength = careerRiasec.size();
        
        for (Map.Entry<String, Integer> entry : careerRiasec.entrySet()) {
            String category = entry.getKey();
            int careerImportance = entry.getValue();
            int userScore = userRiasecScores.getOrDefault(category, 0);
            
            // Higher career importance means this trait is more critical
            // Match score is based on how well user's trait aligns with career needs
            double categoryMatch = (userScore / 100.0) * careerImportance;
            totalMatch += categoryMatch;
        }
        
        return profileLength > 0 ? (totalMatch / profileLength) * 100 : 0;
    }

    /**
     * Calculate subject academic match score (0-100)
     * Compares user's grades in relevant subjects with career requirements
     * Updated: Checks e_03 for mandatory subject availability
     */
    public double subjectMatchScore(Career career, TestSubmissionDTO submission) {
        Map<String, Integer> subjectScores = submission.getSubjectScores();
        List<String> primarySubjects = parseSubjectList(career.getPrimarySubjects());
        
        if (primarySubjects.isEmpty()) return 50; // Neutral score if no specific subjects
        
        // --- PHASE 1 ENHANCEMENT: Hard Subject Filter (e_03) ---
        // Check if user has taken the required subjects
        // We assume 'subjectScores' map only contains subjects the user actually takes
        // If a primary subject is missing from the map, it's a mismatch.
        int missingSubjects = 0;
        for (String subject : primarySubjects) {
            if (!subjectScores.containsKey(subject)) {
                 missingSubjects++;
            }
        }
        
        // If critical subjects are missing, return 0 (Disqualified)
        // We allow 1 missing if there are many requirements, but strict otherwise
        if (missingSubjects > 0) {
            return 0; 
        }
        // -------------------------------------------------------

        double totalScore = 0.0;
        int relevantSubjects = 0;
        
        for (String subject : primarySubjects) {
            if (subjectScores.containsKey(subject)) {
                totalScore += subjectScores.get(subject);
                relevantSubjects++;
            }
        }
        
        if (relevantSubjects == 0) return 50; // Should be caught by missingSubjects check, but safe fallback
        
        double avgScore = totalScore / relevantSubjects;
        
        // Apply subject importance scaling
        // Strong performance (>80) gets bonus, weak performance (<60) gets penalty
        if (avgScore >= 80) return Math.min(100, avgScore * 1.1);
        if (avgScore < 60) return avgScore * 0.8;
        
        return avgScore;
    }

    /**
     * Calculate practical fit score (0-100)
     * Analyzes extracurriculars and subjective responses for alignment
     */
    public double practicalFitScore(Career career, TestSubmissionDTO submission) {
        double score = 50.0; // Base score
        Map<String, Object> answers = submission.getAnswers();
        
        // Analyze extracurriculars alignment
        List<String> extracurriculars = submission.getExtracurriculars();
        List<String> careerTags = parseTagList(career.getTags());
        
        // Count matching interests
        int matches = 0;
        for (String activity : extracurriculars) {
            for (String tag : careerTags) {
                if (activity.toLowerCase().contains(tag.toLowerCase()) || 
                    tag.toLowerCase().contains(activity.toLowerCase())) {
                    matches++;
                    break;
                }
            }
        }
        
        // Bonus for relevant extracurriculars
        score += matches * 10; // +10 points per match
        
        // Analyze subjective text responses using keyword matching
        String subjectiveText = extractSubjectiveText(submission.getAnswers());
        if (subjectiveText != null && !subjectiveText.trim().isEmpty()) {
            double textScore = subjectivityService.analyzeTextAlignment(subjectiveText, career);
            score += textScore * 0.3; // 30% influence from text analysis
        }

        // --- PHASE 2 ENHANCEMENT ---

        // 1. Negative Filtering (e_13 - "Jobs NOT wanted")
        Object e13 = answers.get("e_13");
        if (e13 instanceof String) {
            String unwantedText = ((String) e13).toLowerCase();
            String careerNameLower = career.getCareerName().toLowerCase();
            String bucketLower = career.getBucket().toLowerCase();
            
            // Simple keyword check against career name or bucket keywords
            // e.g. "I hate coding" -> matches "computer science" bucket or "developer" careers
            if (unwantedText.contains(careerNameLower) || 
                (bucketLower.contains("computer") && unwantedText.contains("coding")) ||
                (bucketLower.contains("medical") && unwantedText.contains("blood")) ||
                unwantedText.contains(bucketLower.split(" ")[0])) { // Check first word of bucket
                
                score -= 50; // massive penalty to filter it out
            }
        }

        // 2. Positive Reinforcement (e_12 - "Subjects Enjoyed")
        // Just a simple keyword boost on top of what SubjectivityService does
        Object e12 = answers.get("e_12");
        if (e12 instanceof String) {
            String enjoyedText = ((String) e12).toLowerCase();
            if (enjoyedText.contains(career.getCareerName().toLowerCase()) || 
                enjoyedText.contains(career.getBucket().toLowerCase())) {
                score += 10;
            }
        }
        // ---------------------------
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate contextual fit score (0-100)
     * Considers family background and social factors
     * Updated: Checks e_14 (Long Study), e_09 (Vocational), e_15 (Dream), e_05 (Class Rank)
     */
    public double contextFitScore(Career career, TestSubmissionDTO submission) {
        double score = 50.0; // Base neutral score
        Map<String, Object> answers = submission.getAnswers();

        // Family career influence
        List<String> parentCareers = submission.getParentCareers();
        String careerBucket = career.getBucket();
        
        // Bonus if career aligns with family background
        for (String parentCareer : parentCareers) {
            if (isCareerRelated(parentCareer, careerBucket)) {
                score += 15; // Family familiarity bonus
                break;
            }
        }
        
        // Consider study abroad preferences
        Boolean studyAbroad = submission.getStudyAbroadPreference();
        if (studyAbroad != null) {
            List<String> tags = parseTagList(career.getTags());
            if (studyAbroad && tags.contains("new_age")) {
                score += 10; // New age careers often have international opportunities
            }
        }
        
        // Consider work style preferences
        String workStyle = submission.getWorkStylePreference();
        if (workStyle != null) {
            score += analyzeWorkStyleFit(workStyle, career);
        }

        // --- PHASE 1 & 2 ENHANCEMENT ---
        
        // 1. Long Study Duration (e_14)
        Object e14 = answers.get("e_14");
        if (e14 instanceof String && "No".equals(e14)) {
            String qual = career.getMinQualification();
            if (qual != null && (qual.contains("MBBS") || qual.contains("B.Arch") || qual.contains("PhD") || career.getCareerName().contains("Doctor"))) {
                score -= 30; 
            }
        }

        // 2. Vocational Training (e_09)
        Object e09 = answers.get("e_09");
        boolean isVocationalBucket = "Trades Vocational & Skilled Services".equals(career.getBucket());
        if (e09 instanceof String) {
            if ("Yes, definitely".equals(e09) && isVocationalBucket) {
                score += 25;
            } else if ("No".equals(e09) && isVocationalBucket) {
                score -= 25;
            }
        }

        // 3. Dream Career (e_15)
        Object e15 = answers.get("e_15");
        if (e15 instanceof String) {
            String dream = (String) e15;
            if (career.getBucket().contains(dream) || career.getCareerName().contains(dream)) {
                score += 20;
            }
        }

        // 4. Class Rank (e_05)
        // Adjust for highly competitive fields
        Object e05 = answers.get("e_05");
        if (e05 instanceof String) {
            String rank = (String) e05;
            boolean isCompetitive = career.getBucket().contains("Healthcare") || 
                                    career.getBucket().contains("Core Technology") || 
                                    career.getBucket().contains("Law");

            if (isCompetitive) {
                if (rank.contains("Top 1") || rank.contains("Top 5")) {
                    score += 5; // Small confidence boost
                } else if (rank.contains("Below average")) {
                    score -= 10; // Cautionary penalty
                }
            }
        }

        // 5. Family/Community Sentiment (e_08)
        Object e08 = answers.get("e_08");
        if (e08 instanceof String) {
            String sentimentText = ((String) e08).toLowerCase();
            String careerName = career.getCareerName().toLowerCase();
            String bucketName = career.getBucket().toLowerCase();
            
            boolean mentionsCareer = sentimentText.contains(careerName) || 
                                   sentimentText.contains(bucketName) ||
                                   sentimentText.contains(bucketName.split(" ")[0].toLowerCase()); // e.g. "engineering" from "engineering & core..."

            if (mentionsCareer) {
                if (sentimentText.contains("bad") || sentimentText.contains("taboo") || sentimentText.contains("avoid") || sentimentText.contains("waste")) {
                    score -= 20; // Family disapproval penalty
                } else if (sentimentText.contains("good") || sentimentText.contains("best") || sentimentText.contains("proud") || sentimentText.contains("respect")) {
                    score += 15; // Family approval bonus
                }
            }
        }
        // ---------------------------
        
        return Math.max(0, Math.min(100, score));
    }

    // Helper methods for parsing and analysis

    private Map<String, Integer> parseRiasecProfile(String riasecProfile) {
        Map<String, Integer> profile = new HashMap<>();
        if (riasecProfile != null) {
            for (char c : riasecProfile.toCharArray()) {
                profile.put(String.valueOf(c), 1);
            }
        }
        return profile;
    }

    private List<String> parseSubjectList(String subjects) {
        if (subjects == null) return new ArrayList<>();
        return Arrays.asList(subjects.replaceAll("[\\[\\]\"]", "").split(","))
                .stream().map(String::trim).collect(Collectors.toList());
    }

    private List<String> parseTagList(String tags) {
        if (tags == null) return new ArrayList<>();
        return Arrays.asList(tags.replaceAll("[\\[\\]\"]", "").split(","))
                .stream().map(String::trim).collect(Collectors.toList());
    }

    private List<String> parseStudyPath(String courses) {
        if (courses == null) return new ArrayList<>();
        return Arrays.asList(courses.split(",")).stream()
                .map(String::trim).limit(3).collect(Collectors.toList());
    }

    private String extractSubjectiveText(Map<String, Object> answers) {
        StringBuilder text = new StringBuilder();
        for (Map.Entry<String, Object> entry : answers.entrySet()) {
            if (entry.getKey().startsWith("v_15") || entry.getKey().startsWith("e_12") || 
                entry.getKey().startsWith("e_13") || entry.getKey().startsWith("e_15")) {
                if (entry.getValue() instanceof String) {
                    text.append(entry.getValue()).append(" ");
                }
            }
        }
        return text.toString().trim();
    }

    private List<String> generateTopReasons(Career career, TestSubmissionDTO submission, Map<String, Integer> riasecScores) {
        List<String> reasons = new ArrayList<>();
        
        // RIASEC reasoning
        Map<String, Integer> careerRiasec = parseRiasecProfile(career.getRiasecProfile());
        for (String trait : careerRiasec.keySet()) {
            int userScore = riasecScores.getOrDefault(trait, 0);
            if (userScore > 30) {
                reasons.add(String.format("High %s score (%d%%) — you like %s activities.", 
                    getTraitName(trait), userScore, getTraitDescription(trait)));
            }
        }
        
        // Subject performance reasoning
        List<String> primarySubjects = parseSubjectList(career.getPrimarySubjects());
        for (String subject : primarySubjects) {
            Integer score = submission.getSubjectScores().get(subject);
            if (score != null && score > 75) {
                reasons.add(String.format("Strong %s marks (%d) — good foundation for this field.", subject, score));
            }
        }
        
        // Extracurricular alignment
        List<String> extracurriculars = submission.getExtracurriculars();
        List<String> careerTags = parseTagList(career.getTags());
        for (String activity : extracurriculars) {
            for (String tag : careerTags) {
                if (activity.toLowerCase().contains(tag.toLowerCase())) {
                    reasons.add(String.format("%s extracurricular shows practical interest in this area.", activity));
                    break;
                }
            }
        }
        
        return reasons.stream().limit(3).collect(Collectors.toList());
    }

    private String getTraitName(String trait) {
        return switch (trait) {
            case "R" -> "Realistic";
            case "I" -> "Investigative";
            case "A" -> "Artistic";
            case "S" -> "Social";
            case "E" -> "Enterprising";
            case "C" -> "Conventional";
            default -> trait;
        };
    }

    private String getTraitDescription(String trait) {
        return switch (trait) {
            case "R" -> "hands-on, practical";
            case "I" -> "analytical, research-oriented";
            case "A" -> "creative, expressive";
            case "S" -> "helping, people-focused";
            case "E" -> "leadership, business-minded";
            case "C" -> "organized, detail-oriented";
            default -> "specialized";
        };
    }

    private List<String> generateFirst3Steps(Career career) {
        return Arrays.asList(
            "Explore " + career.getCareerName() + " through online courses or workshops",
            "Connect with professionals in this field for informational interviews",
            "Start a small project related to " + career.getCareerName().toLowerCase()
        );
    }

    private String determineConfidence(double score, TestSubmissionDTO submission) {
        if (score >= 80) return "High";
        if (score >= 60) return "Medium";
        return "Low";
    }

    private String generateChangeRecommendation(Career career, TestSubmissionDTO submission) {
        List<String> primarySubjects = parseSubjectList(career.getPrimarySubjects());
        for (String subject : primarySubjects) {
            Integer score = submission.getSubjectScores().get(subject);
            if (score != null && score < 60) {
                return String.format("If %s performance drops below 50, consider alternative paths.", subject);
            }
        }
        return "Focus on building practical experience through projects and internships.";
    }

    private List<CareerBucket> groupIntoBuckets(List<CareerMatch> careerMatches) {
        // Group careers by bucket and calculate bucket scores
        Map<String, List<CareerMatch>> bucketGroups = new HashMap<>();
        
        for (CareerMatch match : careerMatches) {
            Career career = careerService.findByCareerName(match.getCareerName());
            if (career != null) {
                bucketGroups.computeIfAbsent(career.getBucket(), k -> new ArrayList<>()).add(match);
            }
        }
        
        List<CareerBucket> buckets = new ArrayList<>();
        for (Map.Entry<String, List<CareerMatch>> entry : bucketGroups.entrySet()) {
            List<CareerMatch> matches = entry.getValue();
            int bucketScore = (int) matches.stream().mapToInt(CareerMatch::getMatchScore).average().orElse(0);
            
            CareerBucket bucket = CareerBucket.builder()
                .bucketName(entry.getKey())
                .bucketScore(bucketScore)
                .topCareers(matches.stream().limit(5).collect(Collectors.toList()))
                .build();
            
            buckets.add(bucket);
        }
        
        buckets.sort((a, b) -> Integer.compare(b.getBucketScore(), a.getBucketScore()));
        return buckets;
    }

    private String generateSummaryParagraph(TestSubmissionDTO submission, List<CareerBucket> buckets) {
        if (buckets.isEmpty()) {
            return String.format("%s — complete the assessment to get personalized career recommendations.", 
                submission.getUserName());
        }
        
        String topBucket = buckets.get(0).getBucketName();
        return String.format("%s — your profile shows strong alignment with %s careers. " +
                "We recommend focusing on building relevant skills and gaining practical experience " +
                "in your top-matched fields.", submission.getUserName(), topBucket);
    }

    private boolean isCareerRelated(String parentCareer, String careerBucket) {
        // Simple mapping of parent careers to career buckets
        Map<String, String> careerMapping = Map.of(
            "IT / Software", "Computer Science & Software Development",
            "Finance / Banking", "Business Finance & Consulting",
            "Medicine / Healthcare", "Healthcare & Life Sciences",
            "Education", "Education & Training",
            "Creative Arts", "Design Media & Creative Industries"
        );
        
        return careerBucket.equals(careerMapping.get(parentCareer));
    }

    private double analyzeWorkStyleFit(String workStyle, Career career) {
        // Simple work style matching
        if (workStyle.contains("Office") || workStyle.contains("Lab")) {
            if (career.getBucket().contains("Computer Science") || career.getBucket().contains("Data")) {
                return 10;
            }
        }
        return 0;
    }
}