## Backend API Documentation

This document provides a comprehensive overview of the backend API endpoints. The API is built using Spring Boot and leverages SpringDoc for OpenAPI specification generation. Authentication is primarily JWT-based, with some endpoints requiring an `ADMIN` role or an `X-Admin-Secret` header.

### 1. Admin Controller (`/admin`)

*   **Base URL:** `/admin`
*   **Authentication:** Requires `ROLE_ADMIN` or `X-Admin-Secret` header. All actions are logged.

#### 1.1. List all careers

*   **Endpoint:** `GET /admin/careers`
*   **Description:** Get all careers for admin management.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Response:** `200 OK` - List of `Career` objects.
    *   **Example Response:**
        ```json
        [
            {
                "id": "656bb012a1f1b2c3d4e5f6a7",
                "careerId": "CR001",
                "careerName": "Software Engineer",
                "bucket": "Technology",
                "riasecProfile": "I, A",
                "primarySubjects": "Mathematics, Computer Science",
                "tags": "Programming, Development, IT",
                "minQualification": "Bachelor's Degree",
                "top5CollegeCourses": "Computer Science, Software Engineering, Data Science, Information Technology, AI",
                "baseParagraph": "A software engineer designs, develops, and maintains software systems...",
                "microprojects": "Build a personal website, Develop a mobile app, Contribute to open source",
                "whyFit": "Fits individuals with strong analytical skills and a passion for problem-solving."
            }
        ]
        ```

#### 1.2. Add new career

*   **Endpoint:** `POST /admin/careers`
*   **Description:** Create a new career entry.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Request Body:** `Career` object (JSON) - `@Valid`
    *   **Request Body Example:**
        ```json
        {
          "careerId": "CR002",
          "careerName": "Data Scientist",
          "bucket": "Technology",
          "riasecProfile": "I, C",
          "primarySubjects": "Mathematics, Statistics, Computer Science",
          "tags": "Data Analysis, Machine Learning, AI",
          "minQualification": "Master's Degree",
          "top5CollegeCourses": "Data Science, Applied Statistics, Machine Learning, Business Analytics, Computer Science",
          "baseParagraph": "A data scientist analyzes complex data to extract insights and inform decision-making...",
          "microprojects": "Build a predictive model, Analyze a public dataset, Develop a data visualization dashboard",
          "whyFit": "Fits individuals with strong analytical and programming skills, eager to solve real-world problems with data."
        }
        ```
*   **Response:** `200 OK` - JSON object containing the `savedCareer` and a `message`.
    *   **Example Response:**
        ```json
        {
            "career": {
                "id": "656bb012a1f1b2c3d4e5f6a8",
                "careerId": "CR002",
                "careerName": "Data Scientist",
                "bucket": "Technology",
                "riasecProfile": "I, C",
                "primarySubjects": "Mathematics, Statistics, Computer Science",
                "tags": "Data Analysis, Machine Learning, AI",
                "minQualification": "Master's Degree",
                "top5CollegeCourses": "Data Science, Applied Statistics, Machine Learning, Business Analytics, Computer Science",
                "baseParagraph": "A data scientist analyzes complex data to extract insights and inform decision-making...",
                "microprojects": "Build a predictive model, Analyze a public dataset, Develop a data visualization dashboard",
                "whyFit": "Fits individuals with strong analytical and programming skills, eager to solve real-world problems with data."
            },
            "message": "Career added successfully"
        }
        ```

#### 1.3. Update career

*   **Endpoint:** `PUT /admin/careers/{careerId}`
*   **Description:** Update existing career.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `careerId` (String) - ID of the career to update.
*   **Request Body:** `Career` object (JSON) - `@Valid`
    *   **Request Body Example:**
        ```json
        {
          "careerId": "CR001",
          "careerName": "Software Engineer (Updated)",
          "bucket": "Technology",
          "riasecProfile": "I, A, R",
          "primarySubjects": "Mathematics, Computer Science, Physics",
          "tags": "Programming, Development, IT, Cloud",
          "minQualification": "Bachelor's Degree",
          "top5CollegeCourses": "Computer Science, Software Engineering, Data Science, Information Technology, AI, Cybersecurity",
          "baseParagraph": "A software engineer designs, develops, and maintains software systems, with an updated focus on cloud technologies...",
          "microprojects": "Build a personal website, Develop a mobile app, Contribute to open source, Automate a process",
          "whyFit": "Fits individuals with strong analytical skills and a passion for problem-solving in a dynamic tech environment."
        }
        ```
*   **Response:** `200 OK` - JSON object containing the `updatedCareer` and a `message`. `404 Not Found` if career does not exist.
    *   **Example Response:**
        ```json
        {
            "career": {
                "id": "656bb012a1f1b2c3d4e5f6a7",
                "careerId": "CR001",
                "careerName": "Software Engineer (Updated)",
                "bucket": "Technology",
                "riasecProfile": "I, A, R",
                "primarySubjects": "Mathematics, Computer Science, Physics",
                "tags": "Programming, Development, IT, Cloud",
                "minQualification": "Bachelor's Degree",
                "top5CollegeCourses": "Computer Science, Software Engineering, Data Science, Information Technology, AI, Cybersecurity",
                "baseParagraph": "A software engineer designs, develops, and maintains software systems, with an updated focus on cloud technologies...",
                "microprojects": "Build a personal website, Develop a mobile app, Contribute to open source, Automate a process",
                "whyFit": "Fits individuals with strong analytical skills and a passion for problem-solving in a dynamic tech environment."
            },
            "message": "Career updated successfully"
        }
        ```
```
#### 1.4. Delete career

*   **Endpoint:** `DELETE /admin/careers/{careerId}`
*   **Description:** Delete career by ID.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `careerId` (String) - ID of the career to delete.
*   **Response:** `200 OK` - JSON object containing a `message`. `404 Not Found` if career does not exist.
    *   **Example Response:**
        ```json
        {
            "message": "Career deleted successfully"
        }
        ```

#### 1.5. Seed database

*   **Endpoint:** `POST /admin/seed`
*   **Description:** Import data from CSV/JSON files into the database.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Response:** `200 OK` - `SeedResultDTO` object containing counts of imported careers, tests, and users.
    *   **Example Response:**
        ```json
        {
          "careersImported": 10,
          "testsImported": 5,
          "usersCreated": 50,
          "message": "Database seeded successfully with 10 careers, 5 tests, and 50 users."
        }
        ```

#### 1.6. Recompute user report

*   **Endpoint:** `POST /admin/recompute/{userId}`
*   **Description:** Recompute the latest career report for a user.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `userId` (String) - ID of the user whose report needs recomputation.
*   **Response:** `200 OK` - JSON object containing a `message`.
    *   **Example Response:**
        ```json
        {
            "message": "Report recomputation initiated for user: 656bb012a1f1b2c3d4e5f6a7"
        }
        ```

#### 1.7. Get audit logs

*   **Endpoint:** `GET /admin/audit`
*   **Description:** View admin action audit logs.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Query Parameters:**
    *   `page` (int, optional, default: 0) - Page number for pagination.
    *   `size` (int, optional, default: 50) - Number of items per page.
*   **Response:** `200 OK` - List of `AdminAudit` objects.
    *   **Example Response:**
        ```json
        [
            {
              "id": "656bb012a1f1b2c3d4e5f6b0",
              "adminUser": "admin@example.com",
              "action": "CAREER_UPDATE",
              "details": "Updated career CR001: Software Engineer (Updated)",
              "createdAt": "2025-12-04T09:30:00.123"
            }
        ]
        ```

#### 1.8. Get system statistics

*   **Endpoint:** `GET /admin/stats`
*   **Description:** Get overview statistics for the admin dashboard.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Response:** `200 OK` - JSON object containing system statistics.
    *   **Example Response:**
        ```json
        {
          "totalCareers": 50,
          "totalTests": 2,
          "systemStatus": "operational"
        }
        ```

### 2. Auth Controller (`/api/auth`)

*   **Base URL:** `/api/auth`
*   **Authentication:** Public endpoints for user authentication.

#### 2.1. Register new user

*   **Endpoint:** `POST /api/auth/register`
*   **Description:** Register a new user with the system.
*   **Authentication:** None (Public)
*   **Request Body:** `RegisterRequest` object (JSON) - `@Valid`
    *   **Request Body Example:**
        ```json
        {
          "email": "john.doe@example.com",
          "password": "securepassword123",
          "name": "John Doe",
          "fullName": "John R. Doe",
          "schoolName": "Springfield High",
          "grade": 10,
          "board": "CBSE",
          "mobileNo": "9876543210",
          "studentID": "STU12345",
          "city": "Springfield"
        }
        ```
*   **Response:** `200 OK` - `AuthResponse` object containing JWT token and user details.
    *   **Example Response:**
        ```json
        {
          "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTZiYjAxMmExZjFiMmYzZDRlNWY2YzEiLCJpYXQiOjE2NzgyOTU0MDAsImV4cCI6MTY3ODM4MTgwMH0.your.jwt.token.here",
          "user": {
            "id": "656bb012a1f1b2c3d4e5f6c1",
            "email": "john.doe@example.com",
            "studentID": "STU12345",
            "mobileNo": "9876543210",
            "password": "[ENCODED_PASSWORD]",
            "name": "John Doe",
            "roles": ["ROLE_USER"],
            "active": true,
            "fullName": "John R. Doe",
            "schoolName": "Springfield High",
            "grade": 10,
            "board": "CBSE",
            "city": "Springfield",
            "createdAt": "2025-12-04T09:45:00.123",
            "updatedAt": "2025-12-04T09:45:00.123"
          },
          "message": "User registered successfully"
        }
        ```

#### 2.2. User login

*   **Endpoint:** `POST /api/auth/login`
*   **Description:** Authenticate a user and receive a JWT token.
*   **Authentication:** None (Public)
*   **Request Body:** `AuthRequest` object (JSON) - `@Valid`
    *   **Request Body Example:**
        ```json
        {
          "username": "john.doe@example.com",
          "password": "securepassword123"
        }
        ```
*   **Response:** `200 OK` - `AuthResponse` object containing JWT token and user details.
    *   **Example Response:**
        ```json
        {
          "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTZiYjAxMmExZjFiMmYzZDRlNWY2YzEiLCJpYXQiOjE2NzgyOTU0MDAsImV4cCI6MTY3ODM4MTgwMH0.your.jwt.token.here",
          "user": {
            "id": "656bb012a1f1b2c3d4e5f6c1",
            "email": "john.doe@example.com",
            "studentID": "STU12345",
            "mobileNo": "9876543210",
            "password": "[ENCODED_PASSWORD]",
            "name": "John Doe",
            "roles": ["ROLE_USER"],
            "active": true,
            "fullName": "John R. Doe",
            "schoolName": "Springfield High",
            "grade": 10,
            "board": "CBSE",
            "city": "Springfield",
            "createdAt": "2025-12-04T09:45:00.123",
            "updatedAt": "2025-12-04T09:45:00.123"
          },
          "message": "Login successful"
        }
        ```

#### 2.3. Lookup user

*   **Endpoint:** `POST /api/auth/lookup`
*   **Description:** Look up if a user with given `studentID` or `mobileNo` exists. If found, returns a JWT token and user details.
*   **Authentication:** None (Public)
*   **Request Body:** `LookupRequest` object (JSON)
    *   **Request Body Example:**
        ```json
        {
          "studentID": "STU12345",
          "mobileNo": "9876543210"
        }
        ```
*   **Response:** `200 OK` - `AuthResponse` object containing JWT token and user details. `404 Not Found` if user not found.
    *   **Example Response:**
        ```json
        {
          "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTZiYjAxMmExZjFiMmYzZDRlNWY2YzEiLCJpYXQiOjE2NzgyOTU0MDAsImV4cCI6MTY3ODM4MTgwMH0.your.jwt.token.here",
          "user": {
            "id": "656bb012a1f1b2c3d4e5f6c1",
            "email": "john.doe@example.com",
            "studentID": "STU12345",
            "mobileNo": "9876543210",
            "password": "[ENCODED_PASSWORD]",
            "name": "John Doe",
            "roles": ["ROLE_USER"],
            "active": true,
            "fullName": "John R. Doe",
            "schoolName": "Springfield High",
            "grade": 10,
            "board": "CBSE",
            "city": "Springfield",
            "createdAt": "2025-12-04T09:45:00.123",
            "updatedAt": "2025-12-04T09:45:00.123"
          },
          "message": "Login successful"
        }
        ```

#### 2.4. Verify token

*   **Endpoint:** `GET /api/auth/verify`
*   **Description:** Verify the validity of a JWT token.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Response:** `200 OK` - JSON object indicating token validity.
    *   **Example Response:**
        ```json
        {
          "isValid": true,
          "message": "Token is valid"
        }
        ```

#### 2.5. Upsert/Register User

*   **Endpoint:** `POST /api/auth/upsert-register`
*   **Description:** Upserts a user. If a user with the given `email` or `studentID` exists, it updates their information and returns a new token (effectively logging them in). If the user does not exist, it registers them and returns a token. This is primarily used for batch processing and administrative scripts.
*   **Authentication:** None (Public)
*   **Request Body:** `RegisterRequest` object (JSON) - `@Valid`
    *   **Request Body Example:**
        ```json
        {
          "email": "john.doe@example.com",
          "password": "securepassword123",
          "name": "John Doe",
          "fullName": "John R. Doe",
          "schoolName": "Springfield High",
          "grade": 10,
          "board": "CBSE",
          "mobileNo": "9876543210",
          "studentID": "STU12345",
          "city": "Springfield"
        }
        ```
*   **Response:** `200 OK` - `AuthResponse` object containing JWT token and user details.
    *   **Example Response:**
        ```json
        {
          "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTZiYjAxMmExZjFiMmYzZDRlNWY2YzEiLCJpYXQiOjE2NzgyOTU0MDAsImV4cCI6MTY3ODM4MTgwMH0.your.jwt.token.here",
          "user": {
            "id": "656bb012a1f1b2c3d4e5f6c1",
            "email": "john.doe@example.com",
            "studentID": "STU12345",
            "mobileNo": "9876543210",
            "password": "[ENCODED_PASSWORD]",
            "name": "John Doe",
            "roles": ["ROLE_USER"],
            "active": true,
            "fullName": "John R. Doe",
            "schoolName": "Springfield High",
            "grade": 10,
            "board": "CBSE",
            "city": "Springfield",
            "createdAt": "2025-12-04T09:45:00.123",
            "updatedAt": "2025-12-04T09:45:00.123"
          },
          "message": "User registered/updated successfully"
        }
        ```

### 3. Health Controller (`/health`, `/actuator/health`)

*   **Base URL:** `/`
*   **Authentication:** Public.

#### 3.1. Basic Health Check

*   **Endpoint:** `GET /health`
*   **Description:** Basic health check endpoint for monitoring.
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - JSON object indicating service status, timestamp, and version.
    *   **Example Response:**
        ```json
        {
          "status": "UP",
          "timestamp": "2025-12-04T10:00:00.000Z",
          "service": "naviksha-backend",
          "version": "1.0.0"
        }
        ```

#### 3.2. Spring Boot Actuator Health Check

*   **Endpoint:** `GET /actuator/health`
*   **Description:** Spring Boot Actuator health check (provides more detailed health information).
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - JSON object with detailed health information provided by Spring Boot Actuator.
    *   **Example Response:**
        ```json
        {
          "status": "UP",
          "components": {
            "db": {
              "status": "UP",
              "details": {
                "database": "MongoDB",
                "hello": "1"
              }
            },
            "diskSpace": {
              "status": "UP",
              "details": {
                "total": 249767256064,
                "free": 139154432000,
                "threshold": 10737418240
              }
            },
            "ping": {
              "status": "UP"
            }
          }
        }
        ```

### 4. Report Controller (`/api/reports`)

*   **Base URL:** `/api/reports`
*   **Authentication:** Varies by endpoint.

#### 4.1. Get report by ID

*   **Endpoint:** `GET /api/reports/{reportId}`
*   **Description:** Get career report by ID.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `reportId` (String) - ID of the report.
*   **Response:** `200 OK` - Report data (JSON). `404 Not Found` if report not found.
    *   **Example Response:**
        ```json
        {
          "id": "656bb012a1f1b2c3d4e5f6d1",
          "userId": "656bb012a1f1b2c3d4e5f6c1",
          "reportData": {
            "studentName": "Aisha Sharma",
            "schoolName": "Greenwood High",
            "grade": 10,
            "board": "CBSE",
            "vibeScores": {
              "R": 70, "I": 85, "A": 90, "S": 60, "E": 75, "C": 65
            },
            "eduStats": {
              "math": 90, "science": 88, "english": 75
            },
            "extracurriculars": ["Robotics Club", "Debate Team"],
            "parents": ["Parent1", "Parent2"],
            "top5Buckets": [
              {
                "bucketName": "Technology & IT",
                "bucketScore": 85,
                "topCareers": [
                  {
                    "careerName": "Software Engineer",
                    "matchScore": 95,
                    "topReasons": ["Strong problem-solving skills", "High aptitude in logic and math"],
                    "studyPath": ["B.Tech CSE", "M.Tech Software Engineering"],
                    "first3Steps": ["Learn Python", "Build a small project", "Understand data structures"],
                    "confidence": "High",
                    "whatWouldChangeRecommendation": "Consider specializing in AI for cutting-edge opportunities."
                  },
                  {
                    "careerName": "Data Scientist",
                    "matchScore": 90,
                    "topReasons": ["Analytical mindset", "Strong statistical background"],
                    "studyPath": ["B.Sc Statistics", "M.Sc Data Science"],
                    "first3Steps": ["Learn R/Python", "Master SQL", "Understand machine learning basics"],
                    "confidence": "High",
                    "whatWouldChangeRecommendation": "Focus on big data technologies for broader impact."
                  }
                ]
              },
              {
                "bucketName": "Creative Arts & Design",
                "bucketScore": 75,
                "topCareers": [
                  {
                    "careerName": "Graphic Designer",
                    "matchScore": 88,
                    "topReasons": ["Artistic talent", "Eye for detail"],
                    "studyPath": ["B.Des Graphic Design", "M.Des Visual Communication"],
                    "first3Steps": ["Learn Adobe Photoshop", "Create a portfolio", "Study design principles"],
                    "confidence": "Medium",
                    "whatWouldChangeRecommendation": "Explore UI/UX design for digital opportunities."
                  }
                ]
              }
            ],
            "summaryParagraph": "Aisha shows exceptional aptitude in analytical and logical reasoning, aligning strongly with technology-driven careers. Her extracurricular involvement in robotics further strengthens this profile. There is also a notable interest in creative fields, suggesting a potential for roles that blend technology with design.",
            "aiEnhanced": true,
            "enhancedSummary": "Based on advanced AI analysis, Aisha's profile is highly indicative of success in Software Engineering and Data Science. Her strong foundational skills in mathematics and computer science are complemented by a robust problem-solving approach. Furthermore, her engagement in robotics highlights a practical application of theoretical knowledge. A secondary interest in creative arts suggests potential for roles in UI/UX or game development, where her analytical and creative talents can converge.",
            "skillRecommendations": ["Problem Solving", "Analytical Thinking", "Programming (Python)", "Data Visualization", "Creative Design"],
            "detailedSkillRecommendations": [
              {"skill_name": "Problem Solving", "explanation": "Essential for debugging and optimizing code in software development."},
              {"skill_name": "Analytical Thinking", "explanation": "Crucial for interpreting data and drawing meaningful conclusions in data science."}
            ],
            "careerTrajectoryInsights": "Aisha is well-positioned for a rapid career trajectory in either software development or data science. Early specialization in areas like AI/ML or cybersecurity would further accelerate her growth. Cross-functional skills in project management or team leadership would also be beneficial for long-term career advancement.",
            "detailedCareerInsights": {
              "softwareEngineerOutlook": "High demand, continuous learning required, strong growth potential.",
              "dataScientistOutlook": "Very high demand, requires strong statistical and programming skills, good salary prospects."
            },
            "actionPlan": [
              {"title": "Enroll in advanced Python course", "desc": "Strengthen programming fundamentals relevant to both software and data science.", "timeline": "Next 6 months"},
              {"title": "Participate in a data science hackathon", "desc": "Gain practical experience with real-world datasets and competitive problem-solving.", "timeline": "Next 12 months"},
              {"title": "Explore UI/UX design principles", "desc": "Understand user-centric design for potential roles blending technology and creativity.", "timeline": "Ongoing"}
            ]
          },
          "reportLink": "https://example.com/reports/aisha_report.pdf",
          "createdAt": "2025-12-04T09:45:00.123",
          "updatedAt": "2025-12-04T09:45:00.123"
        }
        ```

#### 4.2. Get user reports

*   **Endpoint:** `GET /api/reports/user/{userId}`
*   **Description:** Get all reports for a specific user.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `userId` (String) - ID of the user.
*   **Response:** `200 OK` - List of `Report` objects.
    *   **Example Response:**
        ```json
        [
            {
              "id": "656bb012a1f1b2c3d4e5f6d1",
              "userId": "656bb012a1f1b2c3d4e5f6c1",
              "reportData": {
                "studentName": "Aisha Sharma",
                "schoolName": "Greenwood High",
                "grade": 10,
                "board": "CBSE",
                "vibeScores": {
                  "R": 70, "I": 85, "A": 90, "S": 60, "E": 75, "C": 65
                },
                "eduStats": {
                  "math": 90, "science": 88, "english": 75
                },
                "extracurriculars": ["Robotics Club", "Debate Team"],
                "parents": ["Parent1", "Parent2"],
                "top5Buckets": [
                  {
                    "bucketName": "Technology & IT",
                    "bucketScore": 85,
                    "topCareers": [
                      {
                        "careerName": "Software Engineer",
                        "matchScore": 95,
                        "topReasons": ["Strong problem-solving skills", "High aptitude in logic and math"],
                        "studyPath": ["B.Tech CSE", "M.Tech Software Engineering"],
                        "first3Steps": ["Learn Python", "Build a small project", "Understand data structures"],
                        "confidence": "High",
                        "whatWouldChangeRecommendation": "Consider specializing in AI for cutting-edge opportunities."
                      },
                      {
                        "careerName": "Data Scientist",
                        "matchScore": 90,
                        "topReasons": ["Analytical mindset", "Strong statistical background"],
                        "studyPath": ["B.Sc Statistics", "M.Sc Data Science"],
                        "first3Steps": ["Learn R/Python", "Master SQL", "Understand machine learning basics"],
                        "confidence": "High",
                        "whatWouldChangeRecommendation": "Focus on big data technologies for broader impact."
                      }
                    ]
                  },
                  {
                    "bucketName": "Creative Arts & Design",
                    "bucketScore": 75,
                    "topCareers": [
                      {
                        "careerName": "Graphic Designer",
                        "matchScore": 88,
                        "topReasons": ["Artistic talent", "Eye for detail"],
                        "studyPath": ["B.Des Graphic Design", "M.Des Visual Communication"],
                        "first3Steps": ["Learn Adobe Photoshop", "Create a portfolio", "Study design principles"],
                        "confidence": "Medium",
                        "whatWouldChangeRecommendation": "Explore UI/UX design for digital opportunities."
                      }
                    ]
                  }
                ],
                "summaryParagraph": "Aisha shows exceptional aptitude in analytical and logical reasoning, aligning strongly with technology-driven careers. Her extracurricular involvement in robotics further strengthens this profile. There is also a notable interest in creative fields, suggesting a potential for roles that blend technology with design.",
                "aiEnhanced": true,
                "enhancedSummary": "Based on advanced AI analysis, Aisha's profile is highly indicative of success in Software Engineering and Data Science. Her strong foundational skills in mathematics and computer science are complemented by a robust problem-solving approach. Furthermore, her engagement in robotics highlights a practical application of theoretical knowledge. A secondary interest in creative arts suggests potential for roles in UI/UX or game development, where her analytical and creative talents can converge.",
                "skillRecommendations": ["Problem Solving", "Analytical Thinking", "Programming (Python)", "Data Visualization", "Creative Design"],
                "detailedSkillRecommendations": [
                  {"skill_name": "Problem Solving", "explanation": "Essential for debugging and optimizing code in software development."},
                  {"skill_name": "Analytical Thinking", "explanation": "Crucial for interpreting data and drawing meaningful conclusions in data science."}
                ],
                "careerTrajectoryInsights": "Aisha is well-positioned for a rapid career trajectory in either software development or data science. Early specialization in areas like AI/ML or cybersecurity would further accelerate her growth. Cross-functional skills in project management or team leadership would also be beneficial for long-term career advancement.",
                "detailedCareerInsights": {
                  "softwareEngineerOutlook": "High demand, continuous learning required, strong growth potential.",
                  "dataScientistOutlook": "Very high demand, requires strong statistical and programming skills, good salary prospects."
                },
                "actionPlan": [
                  {"title": "Enroll in advanced Python course", "desc": "Strengthen programming fundamentals relevant to both software and data science.", "timeline": "Next 6 months"},
                  {"title": "Participate in a data science hackathon", "desc": "Gain practical experience with real-world datasets and competitive problem-solving.", "timeline": "Next 12 months"},
                  {"title": "Explore UI/UX design principles", "desc": "Understand user-centric design for potential roles blending technology and creativity.", "timeline": "Ongoing"}
                ]
              },
              "reportLink": "https://example.com/reports/aisha_report.pdf",
              "createdAt": "2025-12-04T09:45:00.123",
              "updatedAt": "2025-12-04T09:45:00.123"
            }
        ]
        ```

#### 4.3. Get demo report

*   **Endpoint:** `GET /api/reports/demo/aisha`
*   **Description:** Get sample report for Aisha (public demo).
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - `StudentReport` object (JSON).
    *   **Example Response:**
        ```json
        {
          "studentName": "Aisha Sharma",
          "schoolName": "Greenwood High",
          "grade": 10,
          "board": "CBSE",
          "vibeScores": {
            "R": 70, "I": 85, "A": 90, "S": 60, "E": 75, "C": 65
          },
          "eduStats": {
            "math": 90, "science": 88, "english": 75
          },
          "extracurriculars": ["Robotics Club", "Debate Team"],
          "parents": ["Parent1", "Parent2"],
          "top5Buckets": [
            {
              "bucketName": "Technology & IT",
              "bucketScore": 85,
              "topCareers": [
                {
                  "careerName": "Software Engineer",
                  "matchScore": 95,
                  "topReasons": ["Strong problem-solving skills", "High aptitude in logic and math"],
                  "studyPath": ["B.Tech CSE", "M.Tech Software Engineering"],
                  "first3Steps": ["Learn Python", "Build a small project", "Understand data structures"],
                  "confidence": "High",
                  "whatWouldChangeRecommendation": "Consider specializing in AI for cutting-edge opportunities."
                },
                {
                  "careerName": "Data Scientist",
                  "matchScore": 90,
                  "topReasons": ["Analytical mindset", "Strong statistical background"],
                  "studyPath": ["B.Sc Statistics", "M.Sc Data Science"],
                  "first3Steps": ["Learn R/Python", "Master SQL", "Understand machine learning basics"],
                  "confidence": "High",
                  "whatWouldChangeRecommendation": "Focus on big data technologies for broader impact."
                }
              ]
            },
            {
              "bucketName": "Creative Arts & Design",
              "bucketScore": 75,
              "topCareers": [
                {
                  "careerName": "Graphic Designer",
                  "matchScore": 88,
                  "topReasons": ["Artistic talent", "Eye for detail"],
                  "studyPath": ["B.Des Graphic Design", "M.Des Visual Communication"],
                  "first3Steps": ["Learn Adobe Photoshop", "Create a portfolio", "Study design principles"],
                  "confidence": "Medium",
                  "whatWouldChangeRecommendation": "Explore UI/UX design for digital opportunities."
                }
              ]
            }
          ],
          "summaryParagraph": "Aisha shows exceptional aptitude in analytical and logical reasoning, aligning strongly with technology-driven careers. Her extracurricular involvement in robotics further strengthens this profile. There is also a notable interest in creative fields, suggesting a potential for roles that blend technology with design.",
          "aiEnhanced": true,
          "enhancedSummary": "Based on advanced AI analysis, Aisha's profile is highly indicative of success in Software Engineering and Data Science. Her strong foundational skills in mathematics and computer science are complemented by a robust problem-solving approach. Furthermore, her engagement in robotics highlights a practical application of theoretical knowledge. A secondary interest in creative arts suggests potential for roles in UI/UX or game development, where her analytical and creative talents can converge.",
          "skillRecommendations": ["Problem Solving", "Analytical Thinking", "Programming (Python)", "Data Visualization", "Creative Design"],
          "detailedSkillRecommendations": [
            {"skill_name": "Problem Solving", "explanation": "Essential for debugging and optimizing code in software development."},
            {"skill_name": "Analytical Thinking", "explanation": "Crucial for interpreting data and drawing meaningful conclusions in data science."}
          ],
          "careerTrajectoryInsights": "Aisha is well-positioned for a rapid career trajectory in either software development or data science. Early specialization in areas like AI/ML or cybersecurity would further accelerate her growth. Cross-functional skills in project management or team leadership would also be beneficial for long-term career advancement.",
          "detailedCareerInsights": {
            "softwareEngineerOutlook": "High demand, continuous learning required, strong growth potential.",
            "dataScientistOutlook": "Very high demand, requires strong statistical and programming skills, good salary prospects."
          },
          "actionPlan": [
            {"title": "Enroll in advanced Python course", "desc": "Strengthen programming fundamentals relevant to both software and data science.", "timeline": "Next 6 months"},
            {"title": "Participate in a data science hackathon", "desc": "Gain practical experience with real-world datasets and competitive problem-solving.", "timeline": "Next 12 months"},
            {"title": "Explore UI/UX design principles", "desc": "Understand user-centric design for potential roles blending technology and creativity.", "timeline": "Ongoing"}
          ]
        }
        ```

#### 4.4. Check AI service health

*   **Endpoint:** `GET /api/reports/ai-service/health`
*   **Description:** Check if the AI service is available and healthy.
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - JSON object indicating AI service health status.
    *   **Example Response:**
        ```json
        {
          "aiServiceHealthy": true,
          "timestamp": "2025-12-04T10:15:00.000Z",
          "message": "AI service is available and healthy"
        }
        ```

#### 4.5. Save report link (Upsert)

*   **Endpoint:** `PUT /api/reports/{studentID}/link`
*   **Description:** Saves or updates the generated report link for a student. Implements upsert logic: if a report exists for the user, its `reportLink` and `updatedAt` fields are updated; otherwise, a new report is created.
*   **Authentication:** None (Public)
*   **Path Variable:** `studentID` (String) - Student ID.
*   **Request Body:** `ReportLinkRequest` object (JSON)
    *   **Request Body Example:**
        ```json
        {
          "reportLink": "https://example.com/reports/student_STU12345.pdf"
        }
        ```
*   **Response:** `200 OK` - `Report` object (JSON) of the saved/updated report. `404 Not Found` if user not found. `500 Internal Server Error` on failure.
    *   **Example Response:**
        ```json
        {
          "id": "656bb012a1f1b2c3d4e5f6d1",
          "userId": "656bb012a1f1b2c3d4e5f6c1",
          "reportData": null,
          "reportLink": "https://example.com/reports/student_STU12345.pdf",
          "createdAt": "2025-12-04T09:45:00.123",
          "updatedAt": "2025-12-04T09:45:00.123"
        }
        ```

### 5. Test Controller (`/api/tests`)

*   **Base URL:** `/api/tests`
*   **Authentication:** Requires authentication.

#### 5.1. Get available tests

*   **Endpoint:** `GET /api/tests`
*   **Description:** List all available career assessment tests (e.g., "vibematch", "edustats", "combined").
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Response:** `200 OK` - List of `Test` objects.
    *   **Example Response:**
        ```json
        [
            {
                "id": "656bb012a1f1b2c3d4e5f6e1",
                "testId": "vibematch",
                "name": "VibeMatch Career Assessment",
                "description": "Assesses personality and interests to match with career vibepoints.",
                "type": "VIBE",
                "questions": [
                    {
                      "id": "Q1",
                      "text": "I enjoy solving complex problems.",
                      "type": "likert",
                      "required": true,
                      "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                      "instruction": "Rate your agreement with the statement.",
                      "riasecMap": {"R": 1, "I": 2}
                    },
                    {
                      "id": "Q2",
                      "text": "I like working with my hands and building things.",
                      "type": "likert",
                      "required": true,
                      "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                      "instruction": "Rate your agreement with the statement.",
                      "riasecMap": {"R": 2, "C": 1}
                    }
                ]
            },
            {
                "id": "656bb012a1f1b2c3d4e5f6e2",
                "testId": "edustats",
                "name": "EduStats Academic Assessment",
                "description": "Evaluates academic strengths and preferences.",
                "type": "EDU",
                "questions": [
                    {
                      "id": "EQ1",
                      "text": "I prefer subjects like Physics and Math.",
                      "type": "likert",
                      "required": true,
                      "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                      "instruction": "Rate your agreement with the statement.",
                      "riasecMap": {"I": 1, "C": 2}
                    },
                    {
                      "id": "EQ2",
                      "text": "I am good at memorizing facts and figures.",
                      "type": "likert",
                      "required": true,
                      "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                      "instruction": "Rate your agreement with the statement.",
                      "riasecMap": {"C": 1}
                    }
                ]
            }
        ]
        ```
#### 5.2. Get test by ID

*   **Endpoint:** `GET /api/tests/{testId}`
*   **Description:** Get specific test with all its questions.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `testId` (String) - ID of the test (e.g., "vibematch", "edustats").
*   **Response:** `200 OK` - `Test` object (JSON). `404 Not Found` if test does not exist.
    *   **Example Response:**
        ```json
        {
          "id": "656bb012a1f1b2c3d4e5f6e1",
          "testId": "vibematch",
          "name": "VibeMatch Career Assessment",
          "description": "Assesses personality and interests to match with career vibepoints.",
          "type": "VIBE",
          "questions": [
            {
              "id": "Q1",
              "text": "I enjoy solving complex problems.",
              "type": "likert",
              "required": true,
              "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
              "instruction": "Rate your agreement with the statement.",
              "riasecMap": {"R": 1, "I": 2}
            },
            {
              "id": "Q2",
              "text": "I like working with my hands and building things.",
              "type": "likert",
              "required": true,
              "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
              "instruction": "Rate your agreement with the statement.",
              "riasecMap": {"R": 2, "C": 1}
            }
          ]
        }
        ```

#### 5.3. Submit test answer

*   **Endpoint:** `POST /api/tests/{testId}/submit`
*   **Description:** Submit completed test answers and receive career report.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `testId` (String) - ID of the test.
*   **Request Body:** `TestSubmissionDTO` object (JSON)
    *   **Request Body Example:**
        ```json
        {
          "userId": "656bb012a1f1b2c3d4e5f6c1",
          "userName": "John Doe",
          "schoolName": "Springfield High",
          "grade": 10,
          "board": "CBSE",
          "answers": {
            "Q1": 3,
            "Q2": 4,
            "Q3": 2,
            "EQ1": "A",
            "EQ2": "C"
          },
          "subjectScores": {
            "math": 85,
            "science": 78
          },
          "extracurriculars": ["Debate Club", "Robotics"],
          "parentCareers": ["Engineer", "Teacher"],
          "studyAbroadPreference": true,
          "workStylePreference": "Collaborative"
        }
        ```
*   **Response:** `200 OK` - JSON object containing `reportId`, `report` (a full `StudentReport` object), and a `message`.
    *   **Example Response:**
        ```json
        {
          "reportId": "656bb012a1f1b2c3d4e5f6d1",
          "report": {
            "studentName": "Aisha Sharma",
            "schoolName": "Greenwood High",
            "grade": 10,
            "board": "CBSE",
            "vibeScores": {
              "R": 70, "I": 85, "A": 90, "S": 60, "E": 75, "C": 65
            },
            "eduStats": {
              "math": 90, "science": 88, "english": 75
            },
            "extracurriculars": ["Robotics Club", "Debate Team"],
            "parents": ["Parent1", "Parent2"],
            "top5Buckets": [
              {
                "bucketName": "Technology & IT",
                "bucketScore": 85,
                "topCareers": [
                  {
                    "careerName": "Software Engineer",
                    "matchScore": 95,
                    "topReasons": ["Strong problem-solving skills", "High aptitude in logic and math"],
                    "studyPath": ["B.Tech CSE", "M.Tech Software Engineering"],
                    "first3Steps": ["Learn Python", "Build a small project", "Understand data structures"],
                    "confidence": "High",
                    "whatWouldChangeRecommendation": "Consider specializing in AI for cutting-edge opportunities."
                  },
                  {
                    "careerName": "Data Scientist",
                    "matchScore": 90,
                    "topReasons": ["Analytical mindset", "Strong statistical background"],
                    "studyPath": ["B.Sc Statistics", "M.Sc Data Science"],
                    "first3Steps": ["Learn R/Python", "Master SQL", "Understand machine learning basics"],
                    "confidence": "High",
                    "whatWouldChangeRecommendation": "Focus on big data technologies for broader impact."
                  }
                ]
              },
              {
                "bucketName": "Creative Arts & Design",
                "bucketScore": 75,
                "topCareers": [
                  {
                    "careerName": "Graphic Designer",
                    "matchScore": 88,
                    "topReasons": ["Artistic talent", "Eye for detail"],
                    "studyPath": ["B.Des Graphic Design", "M.Des Visual Communication"],
                    "first3Steps": ["Learn Adobe Photoshop", "Create a portfolio", "Study design principles"],
                    "confidence": "Medium",
                    "whatWouldChangeRecommendation": "Explore UI/UX design for digital opportunities."
                  }
                ]
              }
            ],
            "summaryParagraph": "Aisha shows exceptional aptitude in analytical and logical reasoning, aligning strongly with technology-driven careers. Her extracurricular involvement in robotics further strengthens this profile. There is also a notable interest in creative fields, suggesting a potential for roles that blend technology with design.",
            "aiEnhanced": true,
            "enhancedSummary": "Based on advanced AI analysis, Aisha's profile is highly indicative of success in Software Engineering and Data Science. Her strong foundational skills in mathematics and computer science are complemented by a robust problem-solving approach. Furthermore, her engagement in robotics highlights a practical application of theoretical knowledge. A secondary interest in creative arts suggests potential for roles in UI/UX or game development, where her analytical and creative talents can converge.",
            "skillRecommendations": ["Problem Solving", "Analytical Thinking", "Programming (Python)", "Data Visualization", "Creative Design"],
            "detailedSkillRecommendations": [
              {"skill_name": "Problem Solving", "explanation": "Essential for debugging and optimizing code in software development."},
              {"skill_name": "Analytical Thinking", "explanation": "Crucial for interpreting data and drawing meaningful conclusions in data science."}
            ],
            "careerTrajectoryInsights": "Aisha is well-positioned for a rapid career trajectory in either software development or data science. Early specialization in areas like AI/ML or cybersecurity would further accelerate her growth. Cross-functional skills in project management or team leadership would also be beneficial for long-term career advancement.",
            "detailedCareerInsights": {
              "softwareEngineerOutlook": "High demand, continuous learning required, strong growth potential.",
              "dataScientistOutlook": "Very high demand, requires strong statistical and programming skills, good salary prospects."
            },
            "actionPlan": [
              {"title": "Enroll in advanced Python course", "desc": "Strengthen programming fundamentals relevant to both software and data science.", "timeline": "Next 6 months"},
              {"title": "Participate in a data science hackathon", "desc": "Gain practical experience with real-world datasets and competitive problem-solving.", "timeline": "Next 12 months"},
              {"title": "Explore UI/UX design principles", "desc": "Understand user-centric design for potential roles blending technology and creativity.", "timeline": "Ongoing"}
            ]
          },
          "message": "Test submitted successfully"
        }
        ```

#### 5.4. Get test results



*   **Endpoint:** `GET /api/tests/{testId}/results`

*   **Description:** Get the results of a completed test. This typically returns the `StudentReport` data.

*   **Authentication:** `bearerAuth` (Requires authentication)

*   **Path Variable:** `testId` (String) - ID of the test.

*   **Response:** `200 OK` - `StudentReport` object (JSON) containing test results and career recommendations.

    *   **Example Response:**

        ```json

        {

          "studentName": "Aisha Sharma",

          "schoolName": "Greenwood High",

          "grade": 10,

          "board": "CBSE",

          "vibeScores": {

            "R": 70, "I": 85, "A": 90, "S": 60, "E": 75, "C": 65

          },

          "eduStats": {

            "math": 90, "science": 88, "english": 75

          },

          "extracurriculars": ["Robotics Club", "Debate Team"],

          "parents": ["Parent1", "Parent2"],

          "top5Buckets": [

            {

              "bucketName": "Technology & IT",

              "bucketScore": 85,

              "topCareers": [

                {

                  "careerName": "Software Engineer",

                  "matchScore": 95,

                  "topReasons": ["Strong problem-solving skills", "High aptitude in logic and math"],

                  "studyPath": ["B.Tech CSE", "M.Tech Software Engineering"],

                  "first3Steps": ["Learn Python", "Build a small project", "Understand data structures"],

                  "confidence": "High",

                  "whatWouldChangeRecommendation": "Consider specializing in AI for cutting-edge opportunities."

                },

                {

                  "careerName": "Data Scientist",

                  "matchScore": 90,

                  "topReasons": ["Analytical mindset", "Strong statistical background"],

                  "studyPath": ["B.Sc Statistics", "M.Sc Data Science"],

                  "first3Steps": ["Learn R/Python", "Master SQL", "Understand machine learning basics"],

                  "confidence": "High",

                  "whatWouldChangeRecommendation": "Focus on big data technologies for broader impact."

                }

              ]

            },

            {

              "bucketName": "Creative Arts & Design",

              "bucketScore": 75,

              "topCareers": [

                {

                  "careerName": "Graphic Designer",

                  "matchScore": 88,

                  "topReasons": ["Artistic talent", "Eye for detail"],

                  "studyPath": ["B.Des Graphic Design", "M.Des Visual Communication"],

                  "first3Steps": ["Learn Adobe Photoshop", "Create a portfolio", "Study design principles"],

                  "confidence": "Medium",

                  "whatWouldChangeRecommendation": "Explore UI/UX design for digital opportunities."

                }

              ]

            }

          ],

          "summaryParagraph": "Aisha shows exceptional aptitude in analytical and logical reasoning, aligning strongly with technology-driven careers. Her extracurricular involvement in robotics further strengthens this profile. There is also a notable interest in creative fields, suggesting a potential for roles that blend technology with design.",

          "aiEnhanced": true,

          "enhancedSummary": "Based on advanced AI analysis, Aisha's profile is highly indicative of success in Software Engineering and Data Science. Her strong foundational skills in mathematics and computer science are complemented by a robust problem-solving approach. Furthermore, her engagement in robotics highlights a practical application of theoretical knowledge. A secondary interest in creative arts suggests potential for roles in UI/UX or game development, where her analytical and creative talents can converge.",

          "skillRecommendations": ["Problem Solving", "Analytical Thinking", "Programming (Python)", "Data Visualization", "Creative Design"],

          "detailedSkillRecommendations": [

            {"skill_name": "Problem Solving", "explanation": "Essential for debugging and optimizing code in software development."},

            {"skill_name": "Analytical Thinking", "explanation": "Crucial for interpreting data and drawing meaningful conclusions in data science."}

          ],

          "careerTrajectoryInsights": "Aisha is well-positioned for a rapid career trajectory in either software development or data science. Early specialization in areas like AI/ML or cybersecurity would further accelerate her growth. Cross-functional skills in project management or team leadership would also be beneficial for long-term career advancement.",

          "detailedCareerInsights": {

            "softwareEngineerOutlook": "High demand, continuous learning required, strong growth potential.",

            "dataScientistOutlook": "Very high demand, requires strong statistical and programming skills, good salary prospects."

          },

          "actionPlan": [

            {"title": "Enroll in advanced Python course", "desc": "Strengthen programming fundamentals relevant to both software and data science.", "timeline": "Next 6 months"},

            {"title": "Participate in a data science hackathon", "desc": "Gain practical experience with real-world datasets and competitive problem-solving.", "timeline": "Next 12 months"},

            {"title": "Explore UI/UX design principles", "desc": "Understand user-centric design for potential roles blending technology and creativity.", "timeline": "Ongoing"}

          ]

        }

        ```
