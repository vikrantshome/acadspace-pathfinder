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

#### 1.3. Update career

*   **Endpoint:** `PUT /admin/careers/{careerId}`
*   **Description:** Update existing career.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `careerId` (String) - ID of the career to update.
*   **Request Body:** `Career` object (JSON) - `@Valid`

#### 1.4. Delete career

*   **Endpoint:** `DELETE /admin/careers/{careerId}`
*   **Description:** Delete career by ID.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `careerId` (String) - ID of the career to delete.

#### 1.5. Seed database

*   **Endpoint:** `POST /admin/seed`
*   **Description:** Import data from CSV/JSON files into the database.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)

#### 1.6. Recompute user report

*   **Endpoint:** `POST /admin/recompute/{userId}`
*   **Description:** Recompute the latest career report for a user.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Path Variable:** `userId` (String) - ID of the user whose report needs recomputation.

#### 1.7. Get audit logs

*   **Endpoint:** `GET /admin/audit`
*   **Description:** View admin action audit logs.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)
*   **Query Parameters:**
    *   `page` (int, optional, default: 0) - Page number for pagination.
    *   `size` (int, optional, default: 50) - Number of items per page.

#### 1.8. Get system statistics

*   **Endpoint:** `GET /admin/stats`
*   **Description:** Get overview statistics for the admin dashboard.
*   **Authentication:** `bearerAuth` (Requires ADMIN role)

### 2. Auth Controller (`/api/auth`)

*   **Base URL:** `/api/auth`
*   **Authentication:** Public endpoints for user authentication.

#### 2.1. Register new user

*   **Endpoint:** `POST /api/auth/register`
*   **Description:** Register a new user with the system.
*   **Authentication:** None (Public)
*   **Request Body:** `RegisterRequest` object (JSON) - `@Valid`

#### 2.2. User login

*   **Endpoint:** `POST /api/auth/login`
*   **Description:** Authenticate a user and receive a JWT token.
*   **Authentication:** None (Public)
*   **Request Body:** `AuthRequest` object (JSON) - `@Valid`

#### 2.3. Lookup user

*   **Endpoint:** `POST /api/auth/lookup`
*   **Description:** Look up if a user with given `studentID` or `mobileNo` exists. If found, returns a JWT token and user details.
*   **Authentication:** None (Public)
*   **Request Body:** `LookupRequest` object (JSON)

#### 2.4. Get current user

*   **Endpoint:** `GET /api/auth/me`
*   **Description:** Get current authenticated user profile.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Response:** `200 OK` - `AuthResponse` containing user profile.

#### 2.5. Update user profile

*   **Endpoint:** `PUT /api/auth/profile`
*   **Description:** Update user profile information.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Request Body:** Map of fields to update (e.g., `fullName`, `schoolName`, `grade`, `board`).
*   **Response:** `200 OK` - `AuthResponse` containing updated user profile.

#### 2.6. Upsert/Register User

*   **Endpoint:** `POST /api/auth/upsert-register`
*   **Description:** Upserts a user. If a user with the given `email` or `studentID` exists, it updates their information and returns a new token.
*   **Authentication:** None (Public)
*   **Request Body:** `RegisterRequest` object (JSON) - `@Valid`

### 3. Health Controller (`/health`, `/actuator/health`)

*   **Base URL:** `/`
*   **Authentication:** Public.

#### 3.1. Basic Health Check

*   **Endpoint:** `GET /health`
*   **Description:** Basic health check endpoint for monitoring.
*   **Authentication:** None (Public)

#### 3.2. Spring Boot Actuator Health Check

*   **Endpoint:** `GET /actuator/health`
*   **Description:** Spring Boot Actuator health check.
*   **Authentication:** None (Public)

### 4. Report Controller (`/api/reports`)

*   **Base URL:** `/api/reports`
*   **Authentication:** Varies by endpoint.

#### 4.1. Get report by ID

*   **Endpoint:** `GET /api/reports/{reportId}`
*   **Description:** Get career report by ID.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `reportId` (String) - ID of the report.

#### 4.2. Get report link

*   **Endpoint:** `GET /api/reports/{reportId}/report-link`
*   **Description:** Get the external link for a career report.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `reportId` (String) - ID of the report.

#### 4.3. Get user reports

*   **Endpoint:** `GET /api/reports/user/{userId}`
*   **Description:** Get all reports for a specific user.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `userId` (String) - ID of the user.

#### 4.4. Get demo report

*   **Endpoint:** `GET /api/reports/demo/aisha`
*   **Description:** Get sample report for Aisha (public demo).
*   **Authentication:** None (Public)

#### 4.5. Check AI service health

*   **Endpoint:** `GET /api/reports/ai-service/health`
*   **Description:** Check if the AI service is available and healthy.
*   **Authentication:** None (Public)

#### 4.6. Save report link (Upsert)

*   **Endpoint:** `PUT /api/reports/{studentID}/link`
*   **Description:** Saves or updates the generated report link for a student.
*   **Authentication:** None (Public)
*   **Path Variable:** `studentID` (String) - Student ID.
*   **Request Body:** `ReportLinkRequest` object (JSON)

### 5. Test Controller (`/api/tests`, `/api/progress`)

*   **Base URL:** `/api`
*   **Authentication:** Requires authentication.

#### 5.1. Get available tests

*   **Endpoint:** `GET /api/tests`
*   **Description:** List all available career assessment tests (e.g., "vibematch", "edustats", "combined").
*   **Authentication:** `bearerAuth` (Requires authentication)

#### 5.2. Get test by ID

*   **Endpoint:** `GET /api/tests/{testId}`
*   **Description:** Get specific test with all its questions.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `testId` (String) - ID of the test.

#### 5.3. Submit test answer

*   **Endpoint:** `POST /api/tests/{testId}/submit`
*   **Description:** Submit completed test answers and receive career report.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `testId` (String) - ID of the test.
*   **Request Body:** `TestSubmissionDTO` object (JSON). Note: `userId` is extracted from the authentication token.

#### 5.4. Get user progress

*   **Endpoint:** `GET /api/progress/{userId}`
*   **Description:** Get saved test progress for a user.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Path Variable:** `userId` (String) - ID of the user.
*   **Query Parameters:**
    *   `testId` (String, optional) - Filter by specific test ID.

#### 5.5. Save test progress

*   **Endpoint:** `POST /api/progress/save`
*   **Description:** Save current test progress.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Request Body:** `TestProgress` object (JSON).

#### 5.6. Reset test progress

*   **Endpoint:** `POST /api/progress/reset`
*   **Description:** Reset/clear test progress for user.
*   **Authentication:** `bearerAuth` (Requires authentication)
*   **Query Parameters:**
    *   `testId` (String, required) - ID of the test to reset.

#### 5.7. Cleanup duplicate progress

*   **Endpoint:** `POST /api/progress/cleanup`
*   **Description:** Remove duplicate progress entries for user, keeping only the most recent.
*   **Authentication:** `bearerAuth` (Requires authentication)