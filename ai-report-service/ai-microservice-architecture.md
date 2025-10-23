# AI Report Generation Microservice Architecture

## System Architecture Overview

```
┌─────────────────┐    HTTP POST     ┌─────────────────┐    HTTP POST     ┌─────────────────┐
│                 │   /api/tests/    │                 │  /generate-     │                 │
│   Frontend      │   combined/      │   Java Backend  │   report        │   Python AI     │
│   (React)       │   submit         │   (Spring Boot) │                 │   Service       │
│                 │                  │                 │                 │   (FastAPI)     │
└─────────────────┘                  └─────────────────┘                 └─────────────────┘
         │                                     │                                   │
         │ 1. User completes tests             │ 2. Process submission            │ 3. Generate AI
         │    and clicks "Generate Report"     │    - Calculate RIASEC scores     │    enhanced
         │                                     │    - Match careers               │    content
         │                                     │    - Group into buckets          │
         │                                     │                                   │
         │                                     │ 4. Call AI service with context  │
         │                                     │    - Student profile             │
         │                                     │    - Career matches              │
         │                                     │    - RIASEC scores               │
         │                                     │                                   │
         │ 6. Display enhanced report          │ 5. Merge AI enhancements         │
         │    with AI insights                 │    - Enhanced career insights    │
         │                                     │    - Personalized summaries     │
         │                                     │    - Detailed recommendations   │
```

## Data Flow Sequence

### 1. Frontend Request
```typescript
// Frontend calls Java backend
const result = await apiService.submitTest('combined', {
  userName: "Aisha",
  grade: 11,
  board: "CBSE",
  answers: { /* test answers */ },
  subjectScores: { "Mathematics": 88, "Physics": 82 },
  extracurriculars: ["Robotics / Coding"],
  parentCareers: ["IT / Software"]
});
```

### 2. Java Backend Processing
```java
// TestController.submitTest()
StudentReport report = scoringService.computeCareerReport(submission);

// NEW: Call AI service
AIReportService aiService = new AIReportService();
StudentReport enhancedReport = aiService.enhanceReportWithAI(report);

return ResponseEntity.ok(Map.of(
    "reportId", savedReport.getId(),
    "report", enhancedReport,
    "message", "Test submitted successfully"
));
```

### 3. AI Service Processing
```python
# Python FastAPI endpoint
@app.post("/generate-report")
async def generate_report(request: ReportGenerationRequest):
    # Extract data from Java backend
    student_profile = request.student_profile
    career_matches = request.career_matches
    riasec_scores = request.riasec_scores
    
    # Generate AI enhancements
    ai_service = AIGenerationService()
    enhanced_insights = ai_service.generate_detailed_report(
        student_profile, career_matches, riasec_scores
    )
    
    return ReportGenerationResponse(
        enhanced_career_insights=enhanced_insights.career_insights,
        personalized_summary=enhanced_insights.summary,
        skill_recommendations=enhanced_insights.skills,
        confidence_explanations=enhanced_insights.confidence
    )
```

## Key Components

### Java Backend Changes
- **New Service**: `AIReportService` - Handles communication with Python service
- **Modified Service**: `ScoringService` - Calls AI service after basic report generation
- **New Configuration**: AI service URL and timeout settings

### Python AI Service
- **FastAPI Application**: Main web framework
- **AI Generation Service**: Core logic for generating enhanced content
- **Pydantic Models**: Data validation and serialization
- **AI Model Integration**: OpenAI/Claude API calls

### Data Models

#### Input to AI Service
```json
{
  "student_profile": {
    "name": "Aisha",
    "grade": 11,
    "board": "CBSE",
    "riasec_scores": {"R": 12, "I": 48, "A": 18, "S": 8, "E": 6, "C": 8},
    "subject_scores": {"Mathematics": 88, "Physics": 82, "Chemistry": 74},
    "extracurriculars": ["Robotics / Coding", "Debate / MUN"],
    "parent_careers": ["IT / Software"]
  },
  "career_matches": [
    {
      "career_name": "Data Scientist",
      "match_score": 92,
      "bucket": "Data AI & Analytics",
      "riasec_profile": "IA",
      "primary_subjects": ["Mathematics", "Computer Science"],
      "top_reasons": ["High Investigative score", "Strong Math marks"],
      "study_path": ["B.Tech CSE", "Data Science electives"],
      "first3_steps": ["Learn Python", "Kaggle projects", "Build portfolio"]
    }
  ],
  "top_buckets": [
    {
      "bucket_name": "Data AI & Analytics",
      "bucket_score": 88,
      "top_careers": [...]
    }
  ]
}
```

#### Output from AI Service
```json
{
  "enhanced_career_insights": {
    "detailed_explanations": {
      "Data Scientist": "Based on your strong investigative nature (48% I score) and excellent mathematics performance (88%), you have the analytical mindset and quantitative foundation essential for data science. Your robotics and coding extracurriculars demonstrate practical problem-solving skills that align perfectly with the hands-on nature of data analysis..."
    },
    "personalized_study_paths": {
      "Data Scientist": [
        "Focus on advanced mathematics and statistics in 11-12 grade",
        "Learn Python programming through online courses",
        "Complete data science projects on Kaggle",
        "Consider B.Tech in Computer Science with data science electives"
      ]
    },
    "confidence_explanations": {
      "Data Scientist": "High confidence (92%) due to strong alignment in investigative personality traits, excellent quantitative performance, and relevant extracurricular activities that demonstrate practical interest in data analysis."
    }
  },
  "personalized_summary": "Aisha, your profile reveals a clear investigative bent combined with strong mathematical aptitude and practical coding experience. This combination makes you exceptionally well-suited for data science and AI-related careers. Your 48% Investigative score indicates you thrive on analytical challenges, while your 88% in Mathematics provides the quantitative foundation essential for data analysis. The fact that you're already engaged in robotics and coding shows you enjoy the practical application of technical concepts - a key trait for successful data scientists. We recommend focusing on building your programming skills in Python and R, completing hands-on data projects, and considering computer science or data science programs for higher education.",
  "skill_recommendations": [
    "Python programming (essential for data science)",
    "Statistical analysis and probability",
    "Machine learning fundamentals",
    "Data visualization techniques",
    "SQL for database management"
  ],
  "career_trajectory_insights": "Your path to data science could start with building a strong foundation in programming and statistics during 11-12 grade, followed by pursuing a B.Tech in Computer Science or B.Sc in Data Science. Early career roles might include Data Analyst or Junior Data Scientist, progressing to Senior Data Scientist, ML Engineer, or even Chief Data Officer roles as you gain experience."
}
```

## Error Handling Strategy

### AI Service Failures
- **Fallback**: Return basic report without AI enhancements
- **Logging**: Log AI service failures for monitoring
- **Timeout**: Set reasonable timeout (5-10 seconds)
- **Retry**: Optional retry mechanism for transient failures

### Data Validation
- **Input Validation**: Validate all incoming data from Java backend
- **Response Validation**: Ensure AI service returns expected format
- **Graceful Degradation**: Handle missing or malformed data gracefully

## Performance Considerations

- **Caching**: Cache AI responses for similar profiles (optional)
- **Async Processing**: Use async/await for non-blocking operations
- **Timeout Management**: Set appropriate timeouts for AI service calls
- **Resource Management**: Monitor memory usage for AI model operations

## Security Considerations

- **API Keys**: Secure storage of AI service API keys
- **Input Sanitization**: Sanitize all inputs to prevent injection attacks
- **Rate Limiting**: Implement rate limiting for AI service calls
- **Data Privacy**: Ensure student data is handled securely
