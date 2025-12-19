# Acadspace Pathfinder - Technical Summary

This document provides a technical overview of the key processes within the Acadspace Pathfinder application, specifically focusing on test progress saving and the final test submission/report generation flow.

## 1. Test Progress Saving Mechanism

This process ensures a user's answers are saved as they move through a test. The implementation was changed from an asynchronous background save to a synchronous, blocking save.

### Original `async` Implementation

- **Trigger**: A `useEffect` hook in `TestPage.tsx` was triggered by changes in the user's answers or the current question index.
- **Process**: It used a `setTimeout` to delay the save by 1 second (a technique called debouncing). After the delay, it called `apiService.saveProgress` in the background.
- **User Experience**: The user was moved to the next question instantly, without waiting for the save to complete. This prioritized a fluid UI but could potentially lead to a race condition if a user closed the browser immediately after answering.

### Current Synchronous (Blocking) Implementation

- **Trigger**: The `handleNext` function is called when the user clicks the "Next" button.
- **Process**:
    1. A loading state (`saving`) is immediately set to `true`, disabling the "Next" button and showing a "Saving..." spinner.
    2. The app calls `await apiService.saveProgress(...)` and waits for the operation to complete.
    3. **On Success**: The loading state is set to `false`, and the user is navigated to the next question.
    4. **On Failure**: The loading state is set to `false`, an error message is displayed to the user, and they remain on the current question to retry.
- **User Experience**: The user is guaranteed that their answer is saved before moving on, at the cost of a small delay (the time it takes for the API call) between questions.

### Frontend & Backend API

- **File**: `acadspace-pathfinder/src/pages/TestPage.tsx`
- **Function**: `handleNext`
- **API Endpoint**: `POST /api/progress/save`
- **Backend Controller**: `TestController.java`
- **Backend Service**: `ProgressService.java`
- **Action**: The backend receives a `TestProgress` object and persists it to the database, linking it to the user's ID.

---

## 2. Test Submission and Report Generation

This process is triggered when the user finishes the final question of the last test (`edustats`).

### Frontend (`TestPage.tsx`)

1.  **Data Consolidation**: The `completeTest` function is called. It first makes an API call to fetch the user's answers from the *first* test (`vibematch`).
2.  **Payload Construction**: It combines the answers from both `vibematch` and `edustats` tests into a single `submission` object, which conforms to the `TestSubmission` interface. This object includes user info, all answers, and data extracted from the answers (like subject scores and extracurriculars).
3.  **API Call**: The frontend calls `apiService.submitTest('combined', submission)`.

### Backend API: `POST /tests/combined/submit`

- **Endpoint**: `POST /api/tests/combined/submit`
- **Security**: This endpoint is configured as `permitAll()` in `SecurityConfig.java`, meaning it does not require a JWT token for access.
- **Controller**: `TestController.java` (`submitTest` method).

### Backend Logic Flow

1.  **Controller (`TestController`)**:
    - Receives the `TestSubmissionDTO`.
    - Retrieves the user's details.
    - Passes the submission DTO to the `ScoringService`.

2.  **Core Logic (`ScopingService.java`)**: This service is the heart of the report generation.
    - **Calculates Personality Profile**: It first calculates the user's RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) scores from the `vibematch` test answers.
    - **Multi-Factor Scoring**: It iterates through every career in the database and calculates a final, weighted "match score" based on four components:
        - **RIASEC Match (40% weight)**: How well the user's personality fits the career's ideal profile.
        - **Subject Match (30% weight)**: How well the user's academic grades align with subjects important for the career.
        - **Practical Fit (20% weight)**: Keyword analysis of extracurriculars and subjective answers.
        - **Context Fit (10% weight)**: Considers social factors like parents' careers.
    - **Ranks and Groups**: The careers are sorted by match score, and then grouped into "Career Buckets" (e.g., "Healthcare & Life Sciences"), which are also ranked.

3.  **AI Enhancement (`AIServiceClient`)**:
    - A preliminary `StudentReport` is created with all the calculated data.
    - This report is then sent to a separate, external AI service via `aiServiceClient.enhanceReport(report)`.
    - The AI service is responsible for adding qualitative insights, summaries, and recommendations.
    - If the AI service fails, the system proceeds with the non-enhanced report.

4.  **Finalization**:
    - The final `StudentReport` is passed back to the `TestController`.
    - `ReportService.java` saves the report to the database.
    - `EmailService.java` attempts to send a PDF of the report to the user.
    - The controller returns the `reportId` and the full report data to the frontend, which then navigates the user to their report page.
