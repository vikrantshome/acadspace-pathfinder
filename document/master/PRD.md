# Product Requirements Document (PRD): AcadSpace Pathfinder (Naviksha AI)

**Document Status:** Draft / Active
**Last Updated:** February 2026
**Product Name:** AcadSpace Pathfinder (Internal Codename: Naviksha AI)

---

## 1. Executive Summary
AcadSpace Pathfinder is an AI-driven career guidance platform designed to assess student profiles—combining their personality (RIASEC model), academic performance, and extracurricular interests—to generate highly personalized, actionable career reports. The platform leverages a React/TypeScript frontend, a robust Java Spring Boot backend, and a specialized AI microservice to provide students with data-backed, AI-enhanced insights into their future career trajectories.

## 2. The "Why" (Problem Statement)
**The Problem:** High school students frequently lack structured, data-driven guidance when choosing career paths. Traditional career counseling is often generic, subjective, and fails to holistically consider a student's unique blend of personality traits, academic strengths, and practical interests.
**The Opportunity:** By combining established psychological assessments (RIASEC) with modern AI generative capabilities, we can scale high-quality, personalized career counseling. This ensures students receive comprehensive reports that not only suggest careers but provide actionable roadmaps to achieve them.

## 3. Goals & Non-Goals

### Goals (What success looks like)
*   **Accurate Assessment:** Successfully capture and evaluate a student's personality (Vibematch) and academic/extracurricular profile (Edustats).
*   **Actionable Insights:** Generate a comprehensive PDF report that provides top career buckets, specific career matches, and a personalized AI-enhanced action plan.
*   **Scalability & Performance:** Ensure the backend and AI report generation service can handle concurrent student assessments (e.g., during school-wide deployments).
*   **Partner Integration:** Support seamless SSO and profile integration for institutional partners (e.g., NCCI Allen).

### Non-Goals (Out of scope for current phase)
*   Direct communication/chat feature with human career counselors within the app.
*   Direct college application or university admission portals.
*   Job placement or internship matching services.

## 4. User Personas
1.  **The Student (Primary User):** High school student (Grades 8-12) confused about what to study next. Wants a clear, understandable, and encouraging roadmap for their future.
2.  **The Parent (Secondary User):** Wants to understand their child's strengths and is looking for a reliable, data-backed justification for educational investments.
3.  **The System Administrator:** Needs to manage the career database, monitor system health, view audit logs, and trigger mass report recomputations.
4.  **The Institutional Partner (e.g., Allen):** Requires their students to seamlessly log in via SSO and receive co-branded, tailored assessment experiences.

## 5. User Stories
*   *As a Student*, I want to take an interactive personality test so that I can understand my core strengths (RIASEC).
*   *As a Student*, I want to input my academic grades and extracurriculars so that the system understands my practical skills.
*   *As a Student*, I want to download a personalized PDF report so that I can discuss my career options with my parents.
*   *As a Partner Student*, I want to log in using my existing institute credentials (NLP SSO) so that I don't have to create a new account.
*   *As an Admin*, I want to add, update, or delete careers from the database so that the recommendations remain relevant to current market trends.

## 6. Functional Requirements

### 6.1 Authentication & User Management
*   **Standard Auth:** Users must be able to register, log in, and update profiles using email/password.
*   **SSO Integration:** System must support NLP SSO token validation and automatic user profile upsertion.
*   **Progress Tracking:** System must save test progress synchronously to prevent data loss if a user disconnects mid-test.

### 6.2 Assessment Engine
*   **Test Delivery:** Serve multiple test types (`vibematch`, `edustats`).
*   **Scoring Logic:** Calculate RIASEC profile, evaluate subject matches, and determine practical/contextual fit.
*   **Career Matching:** System must rank careers against the student's profile based on weighted metrics (40% RIASEC, 30% Subject, 20% Practical, 10% Context).

### 6.3 Report Generation (AI & PDF)
*   **AI Enhancement:** Pass base student profile and matched careers to the Python AI service to generate a personalized summary, skill recommendations, and an action plan.
*   **PDF Creation:** Generate a downloadable PDF report using `puppeteer-ms` (or `pdf-service`/client-side JS) and store a persistent link to the document.

### 6.4 Admin Dashboard
*   **Career Management:** CRUD operations for the career database.
*   **System Audit:** View logs of administrative actions.
*   **Data Seeding:** Import careers/tests from CSV/JSON securely.

## 7. Non-Functional Requirements
*   **Security:** 
    *   All API endpoints (except public health/webhook endpoints) must require JWT Bearer authentication.
    *   Passwords must be securely hashed.
    *   Protect against data loss during test taking (synchronous state saving).
*   **Performance:** API response times for standard queries should be < 200ms. AI Report generation should complete within an acceptable async window, providing the user with a loading state or "processing" notification.
*   **Scalability:** The application must be containerized (Docker) and capable of horizontal scaling. The AI microservice and PDF microservice must be decoupled to prevent blocking the main Spring Boot thread.
*   **Reliability:** The system must gracefully degrade. If the AI service fails, the system must fallback to generating a basic, non-enhanced report.

## 8. Success Metrics (KPIs)
*   **Completion Rate:** > 85% of users who start the assessment complete all questions and generate a report.
*   **AI Service Uptime:** 99.9% uptime for the `ai-report-service`.
*   **Report Generation Time:** < 15 seconds average from test submission to PDF link availability.
*   **User Retention (Optional):** % of users who log back in to review their report after the initial session.

## 9. User Flow (High Level)
1.  **Landing / Auth:** User arrives -> Registers/Logs in (or uses Partner SSO).
2.  **Onboarding:** User confirms basic profile details (Grade, Board, etc.).
3.  **Vibematch Test:** User answers psychological/interest-based questions. (Progress saved per question).
4.  **Edustats Test:** User inputs academic performance and extracurricular data.
5.  **Submission:** User submits. System displays a loading screen while Backend calculates scores and calls AI service.
6.  **Results Dashboard:** User views interactive charts of their RIASEC profile and top career buckets.
7.  **Report Download:** User clicks "Download PDF", triggering the PDF generation service, and receives the file.

## 10. Risks & Dependencies
*   **AI Hallucination/Latency:** Reliance on external LLM providers (OpenAI/Groq) via the AI microservice introduces risks of high latency or API rate limits. *Mitigation: Implement robust timeouts, retries, and a non-AI fallback report mechanism.*
*   **PDF Generation Bottlenecks:** Puppeteer can be memory-intensive. *Mitigation: Run as an isolated microservice, scale independently, and consider queueing mechanisms if traffic spikes.*
*   **Partner API Stability:** The NLP SSO login relies on an external API (`nlp.nexterp.in`). *Mitigation: Clear error messaging to the user if the external SSO provider is down.*
