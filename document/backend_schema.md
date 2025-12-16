# Backend Database Schema

This document outlines the MongoDB schema for the backend service.

## `User`

**Collection:** `users`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `email` | `String` | User's email address. |
| `studentID` | `String` | **Indexed (unique, sparse).** The student's ID. |
| `mobileNo` | `String` | **Indexed (unique, sparse).** The user's mobile number. |
| `password` | `String` | User's encrypted password. |
| `name` | `String` | User's name. |
| `roles` | `Set<String>` | Set of user roles (e.g., "ROLE_USER", "ROLE_ADMIN"). |
| `active` | `boolean` | Flag to indicate if the user account is active. |
| `fullName` | `String` | User's full name. |
| `parentName` | `String` | Parent's name. |
| `schoolName` | `String` | School name. |
| `grade` | `Integer` | Student's grade. |
| `board` | `String` | School board (e.g., "CBSE"). |
| `city` | `String` | City of the user. |
| `createdAt` | `LocalDateTime` | Timestamp of when the user was created. |
| `updatedAt` | `LocalDateTime` | Timestamp of the last update. |

---

## `AdminAudit`

**Collection:** `admin_audit`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `adminUser` | `String` | The admin user who performed the action. |
| `action` | `String` | The action performed by the admin. |
| `details` | `String` | Details about the action. |
| `createdAt` | `LocalDateTime` | Timestamp of when the audit entry was created. |

---

## `Career`

**Collection:** `careers`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `careerId` | `String` | **Indexed (unique).** A unique ID for the career. |
| `careerName` | `String` | The name of the career. |
| `bucket` | `String` | The career bucket this career belongs to. |
| `riasecProfile` | `String` | The RIASEC profile for this career. |
| `primarySubjects` | `String` | A string representation of a list of primary subjects. |
| `tags` | `String` | A string representation of a list of tags. |
| `minQualification`| `String` | Minimum qualification required for the career. |
| `top5CollegeCourses`| `String` | A string representation of a list of top 5 college courses. |
| `baseParagraph` | `String` | A base paragraph describing the career. |
| `microprojects` | `String` | A string representation of a list of microprojects. |
| `whyFit` | `String` | A paragraph explaining why this career might be a good fit. |

---

## `Report`

**Collection:** `reports`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `userId` | `String` | The ID of the user this report belongs to. |
| `reportData` | `StudentReport` | The detailed student report object. |
| `reportLink` | `String` | A link to the generated PDF report. |
| `createdAt` | `LocalDateTime` | Timestamp of when the report was created. |
| `updatedAt` | `LocalDateTime` | Timestamp of the last update. |

---

## `Sequence`

**Collection:** `sequences`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `lastStudentID` | `String` | The last used student ID, for generating new ones. |

---

## `Test`

**Collection:** `tests`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `testId` | `String` | A unique ID for the test. |
| `name` | `String` | The name of the test. |
| `description` | `String` | A description of the test. |
| `type` | `String` | The type of the test. |
| `questions` | `List<Question>` | A list of questions in the test. |

### `Test.Question` (Embedded Object)

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | A unique ID for the question. |
| `text` | `String` | The question text. |
| `type` | `String` | The type of the question (e.g., "multiple-choice"). |
| `required` | `boolean` | Whether the question is required. |
| `options` | `List<String>` | A list of options for the question. |
| `instruction` | `String` | Instructions for the question. |
| `riasecMap` | `Map<String, Integer>` | A map of RIASEC categories to scores for this question. |

---

## `TestProgress`

**Collection:** `progress`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `String` | **Primary Key.** |
| `userId` | `String` | The ID of the user. |
| `testId` | `String` | The ID of the test. |
| `currentQuestionIndex` | `int` | The index of the last answered question. |
| `answers` | `Map<String, Object>` | A map of question IDs to answers. |
| `completed` | `boolean` | Whether the test has been completed. |
| `createdAt` | `LocalDateTime` | Timestamp of when the progress was first saved. |
| `updatedAt` | `LocalDateTime` | Timestamp of the last update. |

---

### Embedded Objects (Not separate collections)

These models are used as embedded objects within the documents above.

#### `CareerBucket`

| Field | Type | Description |
| --- | --- | --- |
| `bucketName` | `String` | The name of the career bucket. |
| `bucketScore` | `Integer` | The score for this bucket. |
| `topCareers` | `List<CareerMatch>` | A list of top careers in this bucket. |

#### `CareerMatch`

| Field | Type | Description |
| --- | --- | --- |
| `careerName` | `String` | The name of the career. |
| `matchScore` | `Integer` | The match score for this career. |
| `topReasons` | `List<String>` | A list of reasons why this career is a good match. |
| `studyPath` | `List<String>` | A list of study paths for this career. |
| `first3Steps` | `List<String>` | The first 3 steps to pursue this career. |
| `confidence` | `String` | The confidence level of the match (e.g., "High", "Medium", "Low"). |
| `whatWouldChangeRecommendation` | `String` | A recommendation on what would change the match. |

#### `StudentReport`

| Field | Type | Description |
| --- | --- | --- |
| `studentName` | `String` | The name of the student. |
| `schoolName` | `String` | The name of the school. |
| `grade` | `Integer` | The student's grade. |
| `board` | `String` | The school board. |
| `vibeScores` | `Map<String, Integer>` | A map of RIASEC vibe scores. |
| `eduStats` | `Map<String, Integer>` | A map of educational statistics (e.g., subject scores). |
| `extracurriculars`| `List<String>` | A list of extracurricular activities. |
| `parents` | `List<String>` | A list of parent's careers. |
| `top5Buckets` | `List<CareerBucket>` | A list of the top 5 career buckets. |
| `summaryParagraph`| `String` | A summary paragraph of the report. |
| `aiEnhanced` | `Boolean` | Flag indicating if the report was enhanced by AI. |
| `enhancedSummary` | `String` | The AI-enhanced summary. |
| `skillRecommendations` | `List<String>` | A list of skill recommendations. |
| `detailedSkillRecommendations`| `List<Map<String, String>>`| Detailed skill recommendations. |
| `careerTrajectoryInsights` | `String` | Insights on the career trajectory. |
| `detailedCareerInsights` | `Map<String, Object>`| Detailed career insights. |
| `actionPlan` | `List<Map<String, String>>` | A list of action plan items. |

