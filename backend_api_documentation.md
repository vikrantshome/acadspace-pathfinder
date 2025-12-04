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

#### 1.2. Add new career

*   **Endpoint:** `POST /admin/careers`
*   **Description:** Create a new career entry.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Request Body:** `Career` object (JSON) - `@Valid`
*   **Response:** `200 OK` - JSON object containing the `savedCareer` and a `message`.
    *   Example: `{"career": {...}, "message": "Career added successfully"}`

#### 1.3. Update career

*   **Endpoint:** `PUT /admin/careers/{careerId}`
*   **Description:** Update existing career.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `careerId` (String) - ID of the career to update.
*   **Request Body:** `Career` object (JSON) - `@Valid`
*   **Response:** `200 OK` - JSON object containing the `updatedCareer` and a `message`. `404 Not Found` if career does not exist.
    *   Example: `{"career": {...}, "message": "Career updated successfully"}`

#### 1.4. Delete career

*   **Endpoint:** `DELETE /admin/careers/{careerId}`
*   **Description:** Delete career by ID.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `careerId` (String) - ID of the career to delete.
*   **Response:** `200 OK` - JSON object containing a `message`. `404 Not Found` if career does not exist.
    *   Example: `{"message": "Career deleted successfully"}`

#### 1.5. Seed database

*   **Endpoint:** `POST /admin/seed`
*   **Description:** Import data from CSV/JSON files into the database.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Response:** `200 OK` - `SeedResultDTO` object containing counts of imported careers, tests, and users.

#### 1.6. Recompute user report

*   **Endpoint:** `POST /admin/recompute/{userId}`
*   **Description:** Recompute the latest career report for a user.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `userId` (String) - ID of the user whose report needs recomputation.
*   **Response:** `200 OK` - JSON object containing a `message`.
    *   Example: `{"message": "Report recomputation initiated for user: {userId}"}`

#### 1.7. Get audit logs

*   **Endpoint:** `GET /admin/audit`
*   **Description:** View admin action audit logs.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Query Parameters:**
    *   `page` (int, optional, default: 0) - Page number for pagination.
    *   `size` (int, optional, default: 50) - Number of items per page.
*   **Response:** `200 OK` - List of `AdminAudit` objects.

#### 1.8. Get system statistics

*   **Endpoint:** `GET /admin/stats`
*   **Description:** Get overview statistics for the admin dashboard.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Response:** `200 OK` - JSON object containing system statistics (e.g., user count, report count).

### 2. Auth Controller (`/api/auth`)

*   **Base URL:** `/api/auth`
*   **Authentication:** Public endpoints for user authentication.

#### 2.1. Register new user

*   **Endpoint:** `POST /api/auth/register`
*   **Description:** Register a new user with the system.
*   **Authentication:** None (Public)
*   **Request Body:** `RegisterRequest` object (JSON) - `@Valid`
*   **Response:** `200 OK` - `AuthResponse` object containing JWT token and user details.

#### 2.2. User login

*   **Endpoint:** `POST /api/auth/login`
*   **Description:** Authenticate a user and receive a JWT token.
*   **Authentication:** None (Public)
*   **Request Body:** `LoginRequest` object (JSON) - `@Valid`
*   **Response:** `200 OK` - `AuthResponse` object containing JWT token and user details.

#### 2.3. Lookup user

*   **Endpoint:** `POST /api/auth/lookup`
*   **Description:** Look up if a user with given email or mobile number exists.
*   **Authentication:** None (Public)
*   **Request Body:** `LookupRequest` object (JSON)
*   **Response:** `200 OK` - `LookupResponse` object.

#### 2.4. Verify token

*   **Endpoint:** `GET /api/auth/verify`
*   **Description:** Verify the validity of a JWT token.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Response:** `200 OK` - JSON object indicating token validity.

### 3. Health Controller (`/health`, `/actuator/health`)

*   **Base URL:** `/`
*   **Authentication:** Public.

#### 3.1. Basic Health Check

*   **Endpoint:** `GET /health`
*   **Description:** Basic health check endpoint for monitoring.
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - JSON object indicating service status, timestamp, and version.
    *   Example: `{"status": "UP", "timestamp": "...", "service": "naviksha-backend", "version": "1.0.0"}`

#### 3.2. Spring Boot Actuator Health Check

*   **Endpoint:** `GET /actuator/health`
*   **Description:** Spring Boot Actuator health check (provides more detailed health information).
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - JSON object with detailed health information provided by Spring Boot Actuator.

### 4. Report Controller (`/api/reports`)

*   **Base URL:** `/api/reports`
*   **Authentication:** Varies by endpoint.

#### 4.1. Get report by ID

*   **Endpoint:** `GET /api/reports/{reportId}`
*   **Description:** Get career report by ID.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `reportId` (String) - ID of the report.
*   **Response:** `200 OK` - Report data (JSON). `404 Not Found` if report not found.

#### 4.2. Get user reports

*   **Endpoint:** `GET /api/reports/user/{userId}`
*   **Description:** Get all reports for a specific user.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `userId` (String) - ID of the user.
*   **Response:** `200 OK` - List of `Report` objects.

#### 4.3. Get demo report

*   **Endpoint:** `GET /api/reports/demo/aisha`
*   **Description:** Get sample report for Aisha (public demo).
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - `StudentReport` object (JSON).

#### 4.4. Check AI service health

*   **Endpoint:** `GET /api/reports/ai-service/health`
*   **Description:** Check if the AI service is available and healthy.
*   **Authentication:** None (Public)
*   **Response:** `200 OK` - JSON object indicating AI service health status.
    *   Example: `{"aiServiceHealthy": true, "timestamp": "...", "message": "AI service is available and healthy"}`

#### 4.5. Save report link (Upsert)

*   **Endpoint:** `PUT /api/reports/{studentID}/link`
*   **Description:** Saves or updates the generated report link for a student. Implements upsert logic: if a report exists for the user, its `reportLink` and `updatedAt` fields are updated; otherwise, a new report is created.
*   **Authentication:** None (Public)
*   **Path Variable:** `studentID` (String) - Student ID.
*   **Request Body:** `ReportLinkRequest` object (JSON)
    *   Example: `{"reportLink": "https://example.com/report-AB123.pdf"}`
*   **Response:** `200 OK` - `Report` object (JSON) of the saved/updated report. `404 Not Found` if user not found. `500 Internal Server Error` on failure.

### 5. Test Controller (`/api/tests`)

*   **Base URL:** `/api/tests`
*   **Authentication:** Requires authentication.

#### 5.1. Start a new test

*   **Endpoint:** `POST /api/tests/start`
*   **Description:** Start a new career assessment test.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Response:** `200 OK` - JSON object containing test details and the first question.

#### 5.2. Submit test answer

*   **Endpoint:** `POST /api/tests/{testId}/answer`
*   **Description:** Submit an answer for a specific question in a test.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `testId` (String) - ID of the test.
*   **Request Body:** `AnswerSubmission` object (JSON)
*   **Response:** `200 OK` - JSON object with the next question or test completion status.

#### 5.3. Get test results

*   **Endpoint:** `GET /api/tests/{testId}/results`
*   **Description:** Get the results of a completed test.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `testId` (String) - ID of the test.
*   **Response:** `200 OK` - JSON object containing test results and career recommendations.