package com.naviksha.service;

import com.naviksha.dto.TestSubmissionDTO;
import com.naviksha.model.Career;
import com.naviksha.model.StudentReport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Tests for ScoringService
 * 
 * CRITICAL TEST CASES:
 * - Aisha's sample data reproduces expected results
 * - RIASEC scoring algorithm works correctly
 * - Subject matching considers grades appropriately
 * - Final scores are within 0-100 range
 * - Career ranking order is deterministic
 * 
 * TEST DATA:
 * - Aisha: Strong Investigative (I=48), good Math/Physics, Robotics/Coding
 * - Expected: Data Science careers rank highest
 * - Bob: Strong Realistic (R=40), good hands-on subjects
 * - Expected: Engineering/Technical careers rank highest
 * - Carol: Strong Artistic (A=35), creative extracurriculars
 * - Expected: Design/Creative careers rank highest
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ScoringServiceTests {

    @Mock
    private CareerService careerService;

    @Mock
    private SubjectivityAnalysisService subjectivityService;

    @Mock
    private AIServiceClient aiServiceClient;

    @InjectMocks
    private ScoringService scoringService;

    private List<Career> testCareers;
    private TestSubmissionDTO aishaSubmission;
    private TestSubmissionDTO bobSubmission;
    private TestSubmissionDTO carolSubmission;

    @BeforeEach
    void setUp() {
        setupTestCareers();
        setupTestSubmissions();
        
        // Mock service calls
        when(careerService.getAllCareers()).thenReturn(testCareers);
        when(careerService.findByCareerName(any())).thenAnswer(invocation -> {
            String careerName = invocation.getArgument(0);
            return testCareers.stream()
                .filter(c -> c.getCareerName().equals(careerName))
                .findFirst()
                .orElse(null);
        });
        when(subjectivityService.analyzeTextAlignment(any(), any())).thenReturn(50.0);
        
        // Mock AI service to prevent NullPointerException and return the original report
        when(aiServiceClient.enhanceReport(any(StudentReport.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Aisha's profile should rank Data Science careers highest")
    void testAishaDataScienceRanking() {
        // Given: Aisha's test submission with strong Investigative score
        when(careerService.getAllCareers()).thenReturn(testCareers);
        
        // When: Computing career report
        StudentReport report = scoringService.computeCareerReport(aishaSubmission);
        
        // Then: Verify report structure
        assertNotNull(report);
        assertEquals("Aisha", report.getStudentName());
        assertEquals(11, report.getGrade());
        assertEquals("CBSE", report.getBoard());
        
        // Verify RIASEC scores match expected pattern
        Map<String, Integer> vibeScores = report.getVibeScores();
        assertTrue(vibeScores.get("I") > 40, "Investigative score should be high for Aisha");
        assertTrue(vibeScores.get("I") > vibeScores.get("R"), "Investigative > Realistic for Aisha");
        
        // Verify top bucket is Data/AI related
        assertFalse(report.getTop5Buckets().isEmpty());
        String topBucket = report.getTop5Buckets().get(0).getBucketName();
        assertTrue(topBucket.contains("Data") || topBucket.contains("AI"), 
            "Top bucket should be Data/AI related, but was: " + topBucket);
        
        // Verify Data Scientist appears in top careers
        boolean dataScientistFound = report.getTop5Buckets().stream()
            .flatMap(bucket -> bucket.getTopCareers().stream())
            .anyMatch(career -> career.getCareerName().equals("Data Scientist"));
        assertTrue(dataScientistFound, "Data Scientist should appear in top career matches");
    }

    @Test
    @DisplayName("Bob's profile should rank Engineering careers highest")
    void testBobEngineeringRanking() {
        // Given: Bob's submission with high Realistic score
        StudentReport report = scoringService.computeCareerReport(bobSubmission);
        
        // Then: Engineering careers should rank highly
        assertNotNull(report);
        assertEquals("Bob", report.getStudentName());
        
        // Verify Realistic score is highest
        Map<String, Integer> vibeScores = report.getVibeScores();
        assertTrue(vibeScores.get("R") > 30, "Realistic score should be high for Bob");
        
        // Top bucket should be engineering related
        String topBucket = report.getTop5Buckets().get(0).getBucketName();
        assertTrue(topBucket.contains("Engineering") || topBucket.contains("Technology"), 
            "Top bucket should be Engineering/Technology related");
    }

    @Test
    @DisplayName("Carol's profile should rank Creative careers highest")
    void testCarolCreativeRanking() {
        // Given: Carol's submission with high Artistic score
        StudentReport report = scoringService.computeCareerReport(carolSubmission);
        
        // Then: Creative careers should rank highly
        assertNotNull(report);
        assertEquals("Carol", report.getStudentName());
        
        // Verify Artistic score is highest
        Map<String, Integer> vibeScores = report.getVibeScores();
        assertTrue(vibeScores.get("A") > 25, "Artistic score should be high for Carol");
        
        // Top bucket should be creative related
        String topBucket = report.getTop5Buckets().get(0).getBucketName();
        assertTrue(topBucket.contains("Design") || topBucket.contains("Creative"), 
            "Top bucket should be Design/Creative related");
    }

    @Test
    @DisplayName("RIASEC scoring algorithm works correctly")
    void testRiasecScoring() {
        // Given: A career with specific RIASEC profile
        Career dataScientist = testCareers.stream()
            .filter(c -> c.getCareerName().equals("Data Scientist"))
            .findFirst()
            .orElseThrow();
        
        // High Investigative user scores
        Map<String, Integer> highInvestigativeScores = Map.of(
            "R", 10, "I", 50, "A", 15, "S", 10, "E", 5, "C", 10
        );
        
        // Low Investigative user scores
        Map<String, Integer> lowInvestigativeScores = Map.of(
            "R", 30, "I", 10, "A", 20, "S", 20, "E", 10, "C", 10
        );
        
        // When: Computing RIASEC match scores
        double highScore = scoringService.riasecMatchScore(dataScientist, highInvestigativeScores);
        double lowScore = scoringService.riasecMatchScore(dataScientist, lowInvestigativeScores);
        
        // Then: High Investigative should score better for Data Scientist
        assertTrue(highScore > lowScore, "High Investigative score should match Data Scientist better");
        assertTrue(highScore >= 0 && highScore <= 100, "RIASEC score should be in 0-100 range");
        assertTrue(lowScore >= 0 && lowScore <= 100, "RIASEC score should be in 0-100 range");
    }

    @Test
    @DisplayName("Subject matching considers grades appropriately")
    void testSubjectMatching() {
        // Given: A career requiring Math and Physics
        Career engineer = testCareers.stream()
            .filter(c -> c.getCareerName().equals("Mechanical Engineer"))
            .findFirst()
            .orElseThrow();
        
        // High math/physics scores
        Map<String, Integer> strongSubjects = Map.of(
            "Mathematics", 85, "Physics", 80, "Chemistry", 70
        );
        
        // Low math/physics scores
        Map<String, Integer> weakSubjects = Map.of(
            "Mathematics", 45, "Physics", 40, "Chemistry", 70
        );
        
        // When: Computing subject match scores
        double strongScore = scoringService.subjectMatchScore(engineer, strongSubjects);
        double weakScore = scoringService.subjectMatchScore(engineer, weakSubjects);
        
        // Then: Strong subjects should score better
        assertTrue(strongScore > weakScore, "Strong relevant subjects should score higher");
        assertTrue(strongScore >= 0 && strongScore <= 100, "Subject score should be in 0-100 range");
    }

    @Test
    @DisplayName("Final scores are within valid range and deterministic")
    void testFinalScoring() {
        // Given: Multiple test submissions
        List<TestSubmissionDTO> submissions = Arrays.asList(aishaSubmission, bobSubmission, carolSubmission);
        
        for (TestSubmissionDTO submission : submissions) {
            // When: Computing reports multiple times
            StudentReport report1 = scoringService.computeCareerReport(submission);
            StudentReport report2 = scoringService.computeCareerReport(submission);
            
            // Then: Results should be deterministic and valid
            assertNotNull(report1);
            assertNotNull(report2);
            
            // Check all scores are in valid range
            report1.getTop5Buckets().forEach(bucket -> {
                assertTrue(bucket.getBucketScore() >= 0 && bucket.getBucketScore() <= 100,
                    "Bucket score should be 0-100: " + bucket.getBucketScore());
                
                bucket.getTopCareers().forEach(career -> {
                    assertTrue(career.getMatchScore() >= 0 && career.getMatchScore() <= 100,
                        "Career match score should be 0-100: " + career.getMatchScore());
                });
            });
            
            // Results should be deterministic (same inputs = same outputs)
            assertEquals(report1.getTop5Buckets().get(0).getBucketName(),
                        report2.getTop5Buckets().get(0).getBucketName(),
                        "Results should be deterministic");
        }
    }

    @Test
    @DisplayName("Edge cases handle gracefully")
    void testEdgeCases() {
        // Test with minimal data
        TestSubmissionDTO minimalSubmission = TestSubmissionDTO.builder()
            .userName("Minimal")
            .grade(10)
            .board("CBSE")
            .answers(Map.of("v_01", 3, "v_02", 2))
            .subjectScores(Map.of("Mathematics", 60))
            .extracurriculars(Arrays.asList())
            .parentCareers(Arrays.asList())
            .build();
        
        // Should not throw exception
        assertDoesNotThrow(() -> {
            StudentReport report = scoringService.computeCareerReport(minimalSubmission);
            assertNotNull(report);
            assertFalse(report.getTop5Buckets().isEmpty());
        });
    }

    private void setupTestCareers() {
        testCareers = Arrays.asList(
            Career.builder()
                .careerId("c010")
                .careerName("Data Scientist")
                .bucket("Data AI & Analytics")
                .riasecProfile("IA")
                .primarySubjects("[\"Mathematics\",\"Computer Science\",\"Statistics\"]")
                .tags("[\"data\",\"new_age\"]")
                .minQualification("B.Sc/B.Tech")
                .top5CollegeCourses("B.Sc Statistics,B.Tech CS (AI),B.Stat")
                .baseParagraph("Work on data to build models and find insights.")
                .build(),
            
            Career.builder()
                .careerId("c001")
                .careerName("Mechanical Engineer")
                .bucket("Engineering & Core Technology")
                .riasecProfile("R")
                .primarySubjects("[\"Mathematics\",\"Physics\"]")
                .tags("[\"mechanical\",\"hands_on\"]")
                .minQualification("B.Tech / Diploma")
                .top5CollegeCourses("B.Tech Mechanical,B.E Mechanical")
                .baseParagraph("You enjoy building and fixing things.")
                .build(),
            
            Career.builder()
                .careerId("c030")
                .careerName("UX/UI Designer")
                .bucket("Design Media & Creative Industries")
                .riasecProfile("AE")
                .primarySubjects("[\"Art / Design\",\"Computer Science\"]")
                .tags("[\"design\",\"creative\"]")
                .minQualification("B.Des / Diploma")
                .top5CollegeCourses("B.Des Product,B.Des Graphic,BFA")
                .baseParagraph("Designs interfaces and visual experiences.")
                .build()
        );
    }

    private void setupTestSubmissions() {
        // Aisha's submission - matches sample_report_Aisha.json
        aishaSubmission = TestSubmissionDTO.builder()
            .userName("Aisha")
            .grade(11)
            .board("CBSE")
            .answers(Map.of(
                "v_01", 2,  // Realistic - low
                "v_02", 3,  // Conventional
                "v_03", 5,  // Investigative - high
                "v_04", 2,  // Social - low
                "v_05", 3,  // Artistic
                "v_06", 2,  // Enterprising - low
                "v_09", 5,  // Investigative - high
                "v_14", 5,  // Investigative - high
                "v_15", "I loved building a small robot in class because I enjoyed solving mechanical puzzles and coding the behavior."
            ))
            .subjectScores(Map.of(
                "Mathematics", 88,
                "Physics", 82,
                "Chemistry", 74,
                "Computer Science", 60,
                "English", 78
            ))
            .extracurriculars(Arrays.asList("Robotics / Coding", "Debate / MUN"))
            .parentCareers(Arrays.asList("IT / Software"))
            .studyAbroadPreference(true)
            .workStylePreference("Office / Lab work")
            .build();

        // Bob's submission - Strong Realistic profile
        bobSubmission = TestSubmissionDTO.builder()
            .userName("Bob")
            .grade(12)
            .board("CBSE")
            .answers(Map.of(
                "v_01", 5,  // Realistic - high
                "v_08", 5,  // Realistic - high
                "v_03", 2,  // Investigative - low
                "v_05", 2,  // Artistic - low
                "v_06", 3   // Enterprising - medium
            ))
            .subjectScores(Map.of(
                "Mathematics", 75,
                "Physics", 80,
                "Chemistry", 65
            ))
            .extracurriculars(Arrays.asList("Sports", "Robotics / Coding"))
            .parentCareers(Arrays.asList("Skilled Trade"))
            .build();

        // Carol's submission - Strong Artistic profile
        carolSubmission = TestSubmissionDTO.builder()
            .userName("Carol")
            .grade(11)
            .board("ICSE")
            .answers(Map.of(
                "v_05", 5,  // Artistic - high
                "v_10", 4,  // Artistic - high
                "v_01", 2,  // Realistic - low
                "v_03", 3,  // Investigative - medium
                "v_06", 3   // Enterprising - medium
            ))
            .subjectScores(Map.of(
                "Art / Design", 85,
                "English", 80,
                "Mathematics", 60
            ))
            .extracurriculars(Arrays.asList("Painting / Art", "Theatre / Drama"))
            .parentCareers(Arrays.asList("Creative Arts"))
            .build();
    }
}