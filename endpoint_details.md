**Endpoint for New User Creation:**

-   **URL:** `/api/auth/register`
-   **Method:** `POST`

**Request Body (JSON):**

The request body should be a JSON object conforming to the `RegisterRequest` DTO, with the following fields:

-   `email` (String, Optional): User's email address. Must be a valid email format.
-   `password` (String, Required): User's password. Must be at least 6 characters long.
-   `name` (String, Required): User's full name.
-   `fullName` (String, Optional): User's full name (likely for display purposes).
-   `schoolName` (String, Optional): Name of the user's school.
-   `grade` (Integer, Optional): User's grade level.
-   `board` (String, Optional): User's educational board.
-   `mobileNo` (String, Optional): User's mobile number.
-   `studentID` (String, Optional): User's student ID.

**Example Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "New User Name",
  "mobileNo": "1234567890",
  "studentID": "STU12345"
}
```

**Sample Successful Response Body (JSON) for User Creation:**

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJmOWQ5Y2E4MC1lNjYwLTQxYjctYjYwNy01Yjk2YjI3ZmM1YzUiLCJpYXQiOjE2NzgzNzY3MDgsImV4cCI6MTY3ODQ2MzEwOH0.some-jwt-token-string",
  "user": {
    "id": "f9d9ca80-e660-41b7-b607-5b96b27fc5c5",
    "email": "newuser@example.com",
    "name": "New User Name",
    "fullName": "New User Name",
    "schoolName": null,
    "grade": null,
    "board": null,
    "mobileNo": "1234567890",
    "studentID": "STU12345",
    "roles": ["ROLE_USER"]
  },
  "message": "User registered successfully"
}
```

---

**Endpoint for Saving Test Progress (Partial Progress):**

-   **URL:** `/api/progress/save`
-   **Method:** `POST`

**Authentication:**

-   Requires `bearerAuth` (JWT Token in Authorization header). The `userId` will be extracted from the token.

**Request Body (JSON):**

The request body should be a JSON object conforming to the `TestProgress` DTO, with the following fields:

-   `id` (String, Optional): Unique identifier for the progress. If provided, an existing progress entry with this ID will be updated. If not, a new one will be created.
-   `userId` (String, Optional): The ID of the user. **Note:** This field will be automatically set by the backend based on the authenticated user's ID, so it does not need to be explicitly sent in the request body.
-   `testId` (String, Required): The ID of the test (e.g., "vibematch", "edustats").
-   `currentQuestionIndex` (Integer, Required): The 0-based index of the current question the user is on.
-   `answers` (Map<String, Object>, Required): A map where keys are question IDs/numbers (String) and values are the user's answers (Object).
-   `completed` (Boolean, Required): Indicates whether the test is completed (`true`) or still in progress (`false`).
-   `createdAt` (LocalDateTime, Optional): Timestamp for when the progress was created (automatically handled by backend).
-   `updatedAt` (LocalDateTime, Optional): Timestamp for when the progress was last updated (automatically handled by backend).

**Example Request Body:**

```json
{
  "testId": "vibematch",
  "currentQuestionIndex": 5,
  "answers": {
    "q1": "answer_for_q1",
    "q2": "answer_for_q2",
    "q3": "answer_for_q3",
    "q4": "answer_for_q4",
    "q5": "answer_for_q5"
  },
  "completed": false
}
```

**Possible `testId` values for `/api/progress/save`:**

-   `vibematch`: Vibe Match Assessment (Personality and interest assessment based on RIASEC model).
-   `edustats`: Educational Background Assessment (Academic performance and educational preferences assessment).
    *(Note: The `/api/progress/save` endpoint is typically used to save partial progress for a single test. The `combined` testId is primarily used for submitting completed tests via `/api/tests/{testId}/submit`.)*

**Sample Successful Response Body (JSON) for Saving Test Progress:**

```json
{
  "progress": {
    "id": "65f8a2f8d3c1a9b8e7f6d5c4",
    "userId": "f9d9ca80-e660-41b7-b607-5b96b27fc5c5",
    "testId": "vibematch",
    "currentQuestionIndex": 5,
    "answers": {
      "q1": "answer_for_q1",
      "q2": "answer_for_q2",
      "q3": "answer_for_q3",
      "q4": "answer_for_q4",
      "q5": "answer_for_q5"
    },
    "completed": false,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:05:00Z"
  },
  "message": "Progress saved successfully"
}
```

---

**Endpoint for Submitting Completed Tests and Generating a Career Report:**

-   **URL:** `/api/tests/{testId}/submit`
-   **Method:** `POST`

**Authentication:**

-   Requires `bearerAuth` (JWT Token in Authorization header). The `userId` and `userName` will be extracted from the token/user service.

**Path Variable:**

-   `testId` (String, Required): The ID of the test being submitted. Possible values are `vibematch`, `edustats`, or `combined`.

**Request Body (JSON):**

The request body should be a JSON object conforming to the `TestSubmissionDTO`, with the following fields:

-   `userId` (String, Optional): The ID of the user. **Note:** This field will be automatically set by the backend based on the authenticated user's ID, so it does not need to be explicitly sent in the request body.
-   `userName` (String, Required): User's full name.
-   `schoolName` (String, Optional): Name of the user's school.
-   `grade` (Integer, Required): User's grade level.
-   `board` (String, Required): User's educational board.
-   `answers` (Map<String, Object>, Required): A map where keys are question IDs/numbers (String) and values are the user's answers (Object). For a `combined` submission, this map should contain answers for both vibematch and edustats questions.
-   `subjectScores` (Map<String, Integer>, Optional): Map of subject names to scores.
-   `extracurriculars` (List<String>, Optional): List of extracurricular activities.
-   `parentCareers` (List<String>, Optional): List of parent's career fields.
-   `studyAbroadPreference` (Boolean, Optional): Indicates preference for studying abroad.
-   `workStylePreference` (String, Optional): User's preferred work style.

**Example Request Body for `combined` testId:**

```json
{"userName":"Test User 35","schoolName":"Demo School 35","grade":12,"board":"CBSE","answers":{"v_01":2,"v_02":2,"v_03":2,"v_04":2,"v_05":2,"v_06":2,"v_07":2,"v_08":2,"v_09":2,"v_10":2,"v_11":2,"v_12":2,"v_13":2,"v_14":2,"v_15":"maths","e_01":"12","e_02":"CBSE","e_03":["Mathematics"],"e_04":{"Mathematics":95},"e_05":"Top 10","e_06":["Robotics / Coding"],"e_07":["IT / Software"],"e_08":"none","e_09":"Yes, definitely","e_10":"Yes","e_11":"Hybrid","e_12":"maths","e_13":"none","e_14":"Yes","e_15":"Computer Science / AI"},"subjectScores":{"Mathematics":95},"extracurriculars":["Robotics / Coding"],"parentCareers":["IT / Software"]}
```

**Sample Successful Response Body (JSON) for Submitting Completed Tests:**

```json
{
  "reportId": "some-report-id-string",
  "report": {
    "studentName": "New User Name",
    "schoolName": "Example High School",
    "grade": 10,
    "board": "CBSE",
    "vibeScores": {
      "R": 80,
      "I": 70,
      "A": 90,
      "S": 60,
      "E": 50,
      "C": 75
    },
    "eduStats": {
      "mathScore": 85,
      "scienceScore": 92
    },
    "extracurriculars": ["Debate", "Sports"],
    "parents": ["Engineer"],
    "top5Buckets": [
      {
        "bucketName": "Engineering & Technology",
        "matchScore": 95,
        "topCareers": [
          {
            "careerName": "Software Engineer",
            "matchScore": 98,
            "topReasons": ["Strong problem-solving skills", "Interest in coding"],
            "studyPath": ["B.Tech", "M.Tech"],
            "first3Steps": ["Learn Python", "Build a small project"],
            "recommendedSkills": ["Python", "Data Structures"],
            "recommendedCourses": ["CS50", "Python for Everybody"]
          }
        ]
      }
    ],
    "summaryParagraph": "Your profile shows a strong aptitude for analytical and logical reasoning...",
    "aiEnhanced": true,
    "enhancedSummary": "AI-generated enhanced summary...",
    "skillRecommendations": ["Problem Solving", "Critical Thinking"],
    "detailedSkillRecommendations": [
      {
        "skill_name": "Problem Solving",
        "explanation": "Develop skills to tackle complex technical challenges."
      }
    ],
    "careerTrajectoryInsights": "Long-term outlook in tech is excellent...",
    "detailedCareerInsights": {
      "explanations": {
        "Software Engineer": "Software engineering combines creativity and logic..."
      }
    },
    "actionPlan": [
      {
        "title": "Explore AI/ML courses",
        "desc": "Take online courses on Coursera or edX.",
        "timeline": "Next 3 months"
      }
    ]
  },
  "message": "Test submitted successfully"
}
```

---

**Endpoint for Generating PDF Report (Puppeteer Service):**

-   **URL:** `/generate-pdf` (relative to the puppeteer-ms base URL, e.g., `http://localhost:5200/generate-pdf`)
-   **Method:** `POST`

**Request Body (JSON):**

The request body should be a JSON object with the following fields:

-   `reportData` (Object, Required): This is the main student report data, typically a `StudentReport` object (as defined in the Java backend). It contains all the details needed to populate the PDF, including `top5Buckets`, `summaryParagraph`, `vibeScores`, `detailedCareerInsights`, etc.
-   `mobileNo` (String, Optional): Student's mobile number.
-   `studentID` (String, Optional): Student's ID.
-   `studentName` (String, Optional): Student's name.

**Example Request Body:**
A full example `reportData` would be very large, but it essentially mirrors the `StudentReport` model from the Java backend.

```json
{
  "reportData": {
    "studentName": "Example Student",
    "grade": 10,
    "board": "CBSE",
    "vibeScores": {
      "R": 80,
      "I": 70,
      "A": 90,
      "S": 60,
      "E": 50,
      "C": 75
    },
    "eduStats": {
      "mathScore": 85,
      "scienceScore": 92
    },
    "extracurriculars": ["Debate", "Sports"],
    "parents": ["Engineer"],
    "top5Buckets": [
      {
        "bucketName": "Engineering & Technology",
        "matchScore": 95,
        "topCareers": [
          {
            "careerName": "Software Engineer",
            "matchScore": 98,
            "topReasons": ["Strong problem-solving skills", "Interest in coding"],
            "studyPath": ["B.Tech", "M.Tech"],
            "first3Steps": ["Learn Python", "Build a small project"],
            "recommendedSkills": ["Python", "Data Structures"],
            "recommendedCourses": ["CS50", "Python for Everybody"]
          }
        ]
      }
    ],
    "summaryParagraph": "Your profile shows a strong aptitude for analytical and logical reasoning...",
    "careerTrajectoryInsights": "Long-term outlook in tech is excellent...",
    "detailedCareerInsights": {
      "explanations": {
        "Software Engineer": "Software engineering combines creativity and logic..."
      }
    }
  },
  "mobileNo": "9876543210",
  "studentID": "STU987654",
  "studentName": "Example Student"
}
```

**Sample Successful Response Body (JSON) for Generating PDF Report:**

```json
{
  "reportLink": "https://drive.google.com/uc?id=some-google-drive-file-id&export=download"
}
```