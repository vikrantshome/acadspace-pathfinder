# AI Report Service Schema

This document outlines the Pydantic models used for data structures within the `ai-report-service`.

## Request Models

### `ReportGenerationRequest`

This is the main input model from the Java backend.

| Field | Type | Description |
| --- | --- | --- |
| `student_profile` | `StudentProfile` | The student's profile data. |
| `career_matches` | `List[CareerMatch]` | A list of career matches. |
| `top_buckets` | `List[CareerBucket]` | A list of top career buckets. |

---

## Response Models

### `ReportGenerationResponse`

This is the main output model to the Java backend.

| Field | Type | Description |
| --- | --- | --- |
| `enhanced_career_insights` | `EnhancedCareerInsights` | Enhanced career insights from the AI. |
| `personalized_summary` | `str` | A personalized summary for the student. |
| `skill_recommendations` | `List[str]` | A list of skill recommendations. |
| `career_trajectory_insights` | `str` | Insights into the student's career trajectory. |
| `action_plan` | `List[Dict]` | A list of action plan items. |

### `EnhancedCareerInsights`

| Field | Type | Description |
| --- | --- | --- |
| `detailed_explanations` | `Dict[str, str]` | Detailed explanations for career matches. |
| `personalized_study_paths`| `Dict[str, List[str]]`| Personalized study paths for different careers. |
| `confidence_explanations` | `Dict[str, str]` | Explanations for the confidence level of matches. |

---

## Core Data Structures

### `StudentProfile`

| Field | Type | Description |
| --- | --- | --- |
| `name` | `str` | Student's name. |
| `grade` | `int` | Student's grade. |
| `board` | `str` | School board. |
| `riasec_scores` | `Dict[str, int]` | A map of RIASEC scores. |
| `subject_scores` | `Dict[str, int]` | A map of subject scores. |
| `extracurriculars` | `List[str]` | A list of extracurricular activities. |
| `parent_careers` | `List[str]` | A list of parent's careers. |

### `CareerBucket`

| Field | Type | Description |
| --- | --- | --- |
| `bucket_name` | `str` | The name of the career bucket. |
| `bucket_score` | `int` | The score for this bucket. |
| `top_careers` | `List[CareerMatch]` | A list of top careers in this bucket. |

### `CareerMatch`

| Field | Type | Description |
| --- | --- | --- |
| `career_name` | `str` | The name of the career. |
| `match_score` | `int` | The match score for this career. |
| `bucket` | `str` | The career bucket. |
| `riasec_profile` | `str` | The RIASEC profile for the career. |
| `primary_subjects` | `List[str]` | A list of primary subjects for the career. |
| `top_reasons` | `List[str]` | Top reasons for the career match. |
| `study_path` | `List[str]` | Recommended study path. |
| `first3_steps` | `List[str]` | First 3 steps to pursue the career. |
| `confidence` | `str` | Confidence level of the match. |
| `what_would_change_recommendation` | `str` | Recommendation on what would change the match. |

---

## Structured AI Outputs

These models are used for structuring the output from the AI models.

### `CareerExplanation`

| Field | Type | Description |
| --- | --- | --- |
| `career_name` | `str` | Name of the career. |
| `explanation` | `str` | Detailed explanation of why this career fits the student. |
| `key_alignment_factors` | `List[str]` | Top 3 factors that make this career a good match. |
| `potential_challenges` | `List[str]` | Potential challenges or areas to improve. |
| `confidence_level` | `str` | Confidence level: High, Medium, or Low. |

### `StudyPathRecommendation`

| Field | Type | Description |
| --- | --- | --- |
| `career_name` | `str` | Name of the career. |
| `immediate_steps` | `List[str]` | 2-3 immediate steps for current grade level. |
| `medium_term_goals` | `List[str]` | 2-3 medium-term goals (1-2 years). |
| `long_term_path` | `List[str]` | 2-3 long-term educational path recommendations. |
| `priority_subjects` | `List[str]` | Most important subjects to focus on. |

### `SkillRecommendation`

| Field | Type | Description |
| --- | --- | --- |
| `skill_name` | `str` | Name of the skill. |
| `category` | `str` | Category: Technical, Soft Skills, or Academic. |
| `importance_level` | `str` | Importance: Critical, High, Medium, or Low. |
| `development_method`| `str` | How to develop this skill. |
| `timeline` | `str` | Suggested timeline for development. |

### `CareerTrajectory`

| Field | Type | Description |
| --- | --- | --- |
| `career_name` | `str` | Name of the primary career. |
| `immediate_focus` | `str` | What to focus on immediately. |
| `educational_pathway` | `str` | Recommended educational pathway. |
| `career_progression`| `str` | Long-term career progression possibilities. |
| `key_milestones`| `List[str]` | Important milestones to achieve. |

### `PersonalizedSummary`

| Field | Type | Description |
| --- | --- | --- |
| `student_name` | `str` | Name of the student. |
| `personality_analysis`| `str` | Analysis of student's personality and strengths. |
| `top_career_fit`| `str` | Explanation of why the top career fits. |
| `actionable_advice`| `str` | Encouraging and actionable advice. |
| `skills_to_develop`| `List[str]` | Top 3-5 skills to focus on developing. |
| `motivation_message`| `str` | Motivational message for the student. |

### `ConfidenceExplanation`

| Field | Type | Description |
| --- | --- | --- |
| `career_name` | `str` | Name of the career. |
| `match_score` | `int` | Match score percentage. |
| `primary_factors`| `List[str]` | Top 3 factors contributing to this score. |
| `strength_areas`| `List[str]` | Areas where student shows strong alignment. |
| `improvement_areas`| `List[str]` | Areas that could improve the match. |
| `overall_confidence`| `str` | Overall confidence assessment. |

### `ActionPlanItem`

| Field | Type | Description |
| --- | --- | --- |
| `title` | `str` | Title of the action item. |
| `description` | `str` | Description of what to do. |
| `timeline` | `str` | Timeline for the action. |

### `ActionPlan`

| Field | Type | Description |
| --- | --- | --- |
| `items` | `List[ActionPlanItem]` | List of exactly 5 action plan items. |
