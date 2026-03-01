# 4. Technical Design Document (TDD)

**Document Status:** Draft
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Lead Engineer
**Last Updated:** February 2026

## 1. Overview
This document specifies the technical architecture for the Admin Dashboard. It outlines how the React frontend will integrate with the existing Spring Boot backend to support CRUD operations and advanced data display.

## 2. Architecture Diagram (Conceptual)
`[ React SPA (Admin Routes) ] <--- JWT Bearer Auth ---> [ Spring Boot AdminController ] <---> [ MongoDB ]`

## 3. Frontend Architecture

### 3.1. Routing & Protection
*   Create a new layout wrapper: `AdminLayout.tsx`.
*   Implement `AdminRoute.tsx` (Higher Order Component) that checks the `AuthProvider` context. If `user.roles` does not include `ROLE_ADMIN`, redirect to `/`.
*   Routes:
    *   `/admin/dashboard`
    *   `/admin/careers`
    *   `/admin/analytics` (Analytics Data Grid)
    *   `/admin/audit-logs`

### 3.2. Data Management (TanStack Query)
*   Extend `src/lib/api.ts` to include Admin endpoints:
    *   `getAdminStats()`
    *   `getAdminCareers()`
    *   `createCareer(data)`, `updateCareer(id, data)`, `deleteCareer(id)`
    *   `getAdminAuditLogs()`
    *   `getAllReportsForAnalytics()` (Endpoint to fetch flattened analytical data).

### 3.3. Analytics Data Grid Implementation
*   **Library Choice:** TanStack Table v8. It allows high-performance client-side pagination, sorting, and global filtering without freezing the DOM.
*   **Data Flow:** 
    1. Fetch flattened array of student report summaries.
    2. Pass data to the TanStack Table instance.
    3. Render the table with Shadcn UI styling. Provide global search and column sorting.

## 4. Backend Adjustments (If Required)
The existing `AdminController` supports most requirements.
*   **Analytics Endpoint:** We need an endpoint to fetch bulk, flattened report data for the Analytics Data Grid.
*   **Endpoint:** `GET /admin/analytics/reports-summary` - Returns an enriched DTO containing `studentID, studentName, mobileNo, grade, board, state, city, topBucket1, topBucket2, topBucket3, topCareer1, topCareer2, topCareer3, partner, aiEnhanced` for comprehensive analytical viewing.

## 5. Security & Performance
*   **Security:** Ensure CORS and Security filter chains correctly validate the `ROLE_ADMIN` for all `/admin/**` API requests.
*   **Performance:** Client-side pagination in TanStack table will limit DOM nodes rendered simultaneously, ensuring fluid scrolling even with thousands of rows fetched into browser memory.
