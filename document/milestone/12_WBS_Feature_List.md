# 12. Work Breakdown Structure (WBS) & Feature List

**Document Status:** Active
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Project Manager
**Last Updated:** February 2026

## 1. Goal
To provide a hierarchical decomposition of the total scope of work to be carried out by the project team to accomplish the Admin Dashboard milestone and create the required deliverables.

## 2. Work Breakdown Structure (WBS)

### 1.0 Project Management & Documentation
*   1.1 Project Requirements Document (PRD)
*   1.2 Technical Design Document (TDD)
*   1.3 Work Breakdown Structure (WBS) & User Stories
*   1.4 Quality Assurance Test Plan
*   1.5 Release Notes & User Guide

### 2.0 Backend Architecture & API Enhancements
*   2.1 Secure Authentication Flow
    *   2.1.1 Verify JWT `ROLE_ADMIN` validation in Spring Security.
    *   2.1.2 Update API Gateway / CORS configuration for `/admin` routes.
*   2.2 Analytics Data Endpoints
    *   2.2.1 Design `ReportSummaryDTO` to include comprehensive user and report data.
    *   2.2.2 Implement paginated `GET /api/admin/analytics/reports-summary` endpoint.
    *   2.2.3 Implement optimized database queries to flatten MongoDB embedded objects.

### 3.0 Frontend Infrastructure
*   3.1 Application Routing
    *   3.1.1 Create `ProtectedRoute.tsx` wrapper for Role-Based Access Control (RBAC).
    *   3.1.2 Develop `AdminLayout.tsx` for sidebar and top navigation.
*   3.2 API Integration
    *   3.2.1 Add admin endpoints to `src/lib/api.ts`.
    *   3.2.2 Implement TanStack Query hooks for caching and state management.

### 4.0 Core Admin Features (User Interface)
*   4.1 Dedicated Admin Login
    *   4.1.1 Build `/admin/login` page bypassing student lookup flows.
*   4.2 Overview Dashboard
    *   4.2.1 Build KPI summary cards (Users, Tests, Reports, Careers).
*   4.3 Career Management Module
    *   4.3.1 Implement CRUD data grid for the `careers` database collection.
    *   4.3.2 Build add/edit forms with validation (Zod/React Hook Form).
*   4.4 Audit Logs
    *   4.4.1 Build read-only paginated table for `admin_audit` tracking.

### 5.0 Advanced Analytics (VTable Data Grid)
*   5.1 VTable Integration
    *   5.1.1 Install and configure `@visactor/react-vtable`.
    *   5.1.2 Map `ReportSummaryDTO` fields to VTable column definitions.
*   5.2 VTable Refinements
    *   5.2.1 Implement server-side pagination bridging.
    *   5.2.2 Implement page size selector (50, 100, 500 rows).
    *   5.2.3 Implement dynamic column freezing (Sticky Columns).
    *   5.2.4 Implement client-side column filtering for loaded pages.
    *   5.2.5 Adjust layout (reduce sidebar width) to maximize horizontal grid space.
*   5.3 Data Export
    *   5.3.1 Implement generic Excel/CSV export functionality for flattened grid data.

### 6.0 QA, Testing & Deployment
*   6.1 Manual Functional Testing
*   6.2 UI/UX Responsiveness Testing
*   6.3 Production Deployment & Smoke Tests
