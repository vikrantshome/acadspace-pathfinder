# 3. Decision Log

**Document Status:** Active
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** PM / Project Lead
**Last Updated:** February 2026

## Overview
This log tracks key architectural, product, and design decisions made during the lifecycle of the Admin Dashboard milestone to ensure team alignment and prevent circular discussions.

| ID | Date | Topic / Question | Decision | Rationale | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DEC-001 | Feb 2026 | **Pivot Table Library** | Decided to use `ag-grid-react` (Community/Enterprise) OR custom `TanStack Table` implementation depending on licensing constraints. | Need highly professional, performant pivot capabilities out of the box. Building a pivot table from scratch is high effort/low reward. | Open |
| DEC-002 | Feb 2026 | **Admin Routing Structure** | Decided to host the Admin Dashboard within the existing React SPA but under a protected `/admin/*` route group. | Prevents the need to set up a completely separate deployment pipeline for an internal tool. Code sharing for API client is maximized. | Approved |
| DEC-003 | Feb 2026 | **Authentication Mechanism** | Utilize existing JWT infrastructure. Admin routes will check `roles` array in JWT payload for `ROLE_ADMIN`. | Security infrastructure is already implemented in the Spring Boot backend. No need to reinvent the wheel. | Approved |
| DEC-004 | Feb 2026 | **Data Fetching for Analytics** | Initial release will fetch raw data to the client to pivot in-browser. | Keeps backend simple for v1. If payload exceeds 50MB, we will revisit backend aggregation in v2. | Approved |

*New decisions will be appended to this log as the project progresses.*
