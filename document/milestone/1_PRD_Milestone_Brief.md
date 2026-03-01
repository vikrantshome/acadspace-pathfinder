# 1. Product Requirements Document (PRD) / Milestone Brief

**Document Status:** Draft
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Product Manager
**Last Updated:** February 2026

## 1. Executive Summary
The AcadSpace Pathfinder application currently lacks a graphical user interface for administrators. All backend endpoints for administration exist, but they must be accessed via API clients. This milestone aims to build a highly professional, web-based Admin Dashboard that provides intuitive access to system statistics, career data management, audit logs, and an advanced Pivot Table for in-depth data analytics on user assessments and career matching trends.

## 2. Problem Statement
**The "Why":** As the platform scales, relying on engineering or technical tools (like Postman) to manage careers, analyze student outcomes, and monitor the platform creates bottlenecks and restricts operational efficiency. Business operators need a self-serve, visual dashboard to monitor KPIs, manage the core database, and extract dynamic insights.

## 3. Goals & Success Metrics
*   **Goal 1:** Provide a seamless and secure React-based web interface authenticated via existing Admin roles/tokens.
*   **Goal 2:** Implement a high-performance, interactive Pivot Table to allow operational teams to drag-and-drop dimensions (e.g., User Demographics, Top Careers, Test Status) for ad-hoc reporting.
*   **Goal 3:** Enable CRUD operations for the Career Database through the UI.
*   **Metrics:** 
    *   100% of admin tasks can be completed via the UI instead of API calls.
    *   Pivot table loads datasets of up to 10k rows within 3 seconds.

## 4. User Personas
*   **The System Administrator / Operations Manager:** Needs to view platform health, update career recommendations, and run complex queries to see which career buckets are trending.

## 5. Scope & Key Features (Functional Requirements)
1.  **Secure Admin Authentication:** Login portal specific to admins or conditional routing based on `ROLE_ADMIN`.
2.  **Overview Dashboard:** High-level widgets showing System Stats (total users, total reports generated, tests taken).
3.  **Career Management Module:** A data grid with Edit/Add/Delete capabilities directly connected to the `/admin/careers` API.
4.  **Analytics Data Grid:** A professional-grade data table component (using TanStack Table) connected to user/report data endpoints. Must support pagination, global filtering, and sorting to handle large datasets gracefully. It will expose extensive student profile data (RIASEC, scores, top matches).
5.  **Audit Logs Viewer:** A read-only table displaying the `admin_audit` collection for compliance.

## 6. Out of Scope
*   Building new backend endpoints (most are already available; minimal tweaks permitted if necessary for the pivot table).
*   Public-facing analytics for students/parents.
*   Modifying the existing student-facing application flow.
