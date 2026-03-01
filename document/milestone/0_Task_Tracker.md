# Project Task & Progress Tracker

**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Status:** In Progress
**Last Updated:** February 2026

## Legend
- [ ] Todo
- [~] In Progress
- [x] Done
- 🛑 Blocked
- 📦 Backlog

---

## Phase 1: Planning & Definition
- [x] **TASK-1.1: Milestone Documentation**
  - [x] Create PRD / Milestone Brief
  - [x] Create Design Specifications
  - [x] Initialize Decision Log
- [x] **TASK-1.2: Technical Documentation**
  - [x] Create Technical Design Document (TDD)
  - [x] Draft API Documentation Updates
  - [x] Map Data Dictionary for Analytics Pivot
- [x] **TASK-1.3: QA & Delivery Documentation**
  - [x] Draft Test Plan & Scenarios
  - [x] Create Requirement Traceability Matrix
  - [x] Initialize Release Notes, User Guide, and Post-Mortem templates

---

## Phase 2: Backend Preparation (API & Auth)
- [x] **TASK-2.1: Admin Role Verification**
  - [x] Validate `ROLE_ADMIN` behavior in existing JWT payload.
  - [x] Ensure all `/admin/**` endpoints properly block unauthorized users.
- [x] **TASK-2.2: Analytics Pivot Data Endpoint**
  - [x] Create/update endpoint for fetching bulk report/user data.
  - [x] Optimize query to flatten `StudentReport` embedded objects.
  - [x] Write backend unit tests for new analytics query.
- [x] **TASK-2.3: CORS & Configuration**
  - [x] Ensure Spring Security CORS config permits the admin dashboard routes/headers.

---

## Phase 3: Frontend Infrastructure & Layout
- [x] **TASK-3.1: Admin Routing Setup**
  - [x] Create `AdminLayout.tsx` (Sidebar, Topbar).
  - [x] Implement `ProtectedRoute.tsx` (Role-based access control checking `user.roles`).
  - [x] Setup nested routes: `/admin/dashboard`, `/admin/careers`, `/admin/analytics`, `/admin/audit`.
- [x] **TASK-3.2: API Client Updates**
  - [x] Add Admin endpoints to `src/lib/api.ts` (e.g., `getAdminStats`, `getCareers`, `createCareer`, etc.).
  - [x] Implement `useQuery` and `useMutation` hooks for admin endpoints.
- [x] **TASK-3.3: Global UI Components**
  - [x] Ensure Shadcn UI components (Tables, Modals, Forms, Sidebar) are ready for admin use.

---

## Phase 4: Core Admin Features (Frontend)
- [x] **TASK-4.1: Overview Dashboard (`/admin/dashboard`)**
  - [x] Build KPI summary cards (Total Users, Tests, Reports).
  - [x] Implement basic charts (e.g., Tests taken over time) using Recharts.
- [x] **TASK-4.2: Career Management (`/admin/careers`)**
  - [x] Implement Data Table to list all careers.
  - [x] Build "Add Career" modal/form with validation (Zod + React Hook Form).
  - [x] Build "Edit Career" modal/form.
  - [x] Implement "Delete Career" with confirmation dialog and toast notifications.
- [x] **TASK-4.3: Audit Logs (`/admin/audit`)**
  - [x] Implement read-only Data Table with pagination to display `admin_audit` records.

---

## Phase 5: Analytics Data Grid (`/admin/analytics`)
- [x] **TASK-5.1: Backend Data Enrichment & Pagination**
  - [x] Update `ReportSummaryDTO` to include comprehensive fields (name, phone, RIASEC scores, top 3 careers, partner, etc.).
  - [x] Update `/analytics/reports-summary` endpoint to accept `page` and `size` query parameters.
  - [x] Update `AdminService` to return a `Page<ReportSummaryDTO>` instead of a full `List`.
- [x] **TASK-5.2: Data Grid Library Setup**
  - [x] Install and configure `@visactor/react-vtable` for advanced paginated data display.
- [x] **TASK-5.3: UI/UX Implementation (Server-Side Pagination)**
  - [x] Build a robust Data Table component utilizing VTable.
  - [x] Implement server-side pagination controls (Next/Previous calls backend).
  - [x] Display the enriched student data cleanly.
- [x] **TASK-5.4: VTable Refinements (Current Sprint)**
  - [x] Implement row count selector (e.g. 50, 100, 500 per page).
  - [x] Implement column-wise searching/filtering using VTable's `customRender` or header plugins.
  - [x] Reduce the left sidebar width to maximize horizontal space for the grid.
- [x] **TASK-5.5: Export Functionality**
  - [x] Implement a full-data export endpoint or allow the current export to bypass pagination.

---

## Phase 6: QA, Testing, & Final Polish
- [ ] **TASK-6.1: Functional Testing**
  - [ ] Execute tests per `7_Test_Plan.md`.
  - [ ] Verify Admin routing security (preventing regular user access).
- [ ] **TASK-6.2: Responsive & Theme Testing**
  - [ ] Test on tablet/mobile viewports.
  - [ ] Verify Light/Dark mode aesthetics.
- [ ] **TASK-6.3: Bug Fixing**
  - [ ] Resolve QA bugs and regressions.
- [ ] **TASK-6.4: Documentation Finalization**
  - [ ] Complete User Guide (`10_User_Guide.md`).
  - [ ] Finalize Release Notes (`9_Release_Notes.md`).

---

## Phase 7: Deployment & Post-Launch
- [ ] **TASK-7.1: Production Deployment**
  - [ ] Merge Admin features to main branch.
  - [ ] Monitor CI/CD build and deploy.
- [ ] **TASK-7.2: Verification**
  - [ ] Smoke testing in production environment.
- [ ] **TASK-7.3: Post-Mortem**
  - [ ] Conduct retro meeting and fill out `11_Post_Mortem.md`.

