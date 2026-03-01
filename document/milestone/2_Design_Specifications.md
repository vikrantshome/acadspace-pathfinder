# 2. Design Specifications

**Document Status:** Draft
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Product Designer
**Last Updated:** February 2026

## 1. Overview
This document outlines the high-level design specifications, UI/UX philosophy, and structural layout for the AcadSpace Admin Dashboard.

## 2. Design System & Technology
*   **UI Framework:** Shadcn UI + Tailwind CSS (consistent with the existing frontend).
*   **Iconography:** Lucide React.
*   **Theme:** Clean, enterprise-grade interface. Dark/Light mode support. High contrast for readability.
*   **Layout:** Standard Admin App shell.
    *   **Left Sidebar:** Navigation menu (Dashboard, Careers, Analytics Pivot, Audit Logs, Settings).
    *   **Top Nav:** Breadcrumbs, User Avatar, Logout, and Quick Search.
    *   **Main Content Area:** Dynamic rendering of the selected view.

## 3. Key Views & Wireframe Descriptions

### 3.1. Overview Dashboard
*   **Top Row:** Summary KPI Cards (Total Users, Active Tests, Reports Generated).
*   **Middle Row:** Bar chart showing "Tests Taken over Last 7 Days".
*   **Bottom Row:** Quick links to recently added Careers and recent Audit Log entries.

### 3.2. Career Management Data Grid
*   A responsive table displaying career data.
*   **Actions:** Action menu (three dots) on each row for "Edit", "Delete".
*   **Add Button:** A prominent "Add New Career" button opening a side-sheet or modal form.
*   **Form:** Multi-step or clearly sectioned form for RIASEC profiles, tags, and rich text areas for paragraphs.

### 3.3. Analytics Pivot Table (The "Wow" Factor)
*   **Layout:** Full-width component.
*   **Controls:** Left pane or top bar for dragging/dropping Fields (e.g., `Grade`, `Board`, `Top Bucket`, `City`) into Rows, Columns, and Values areas.
*   **Data Area:** The pivot table grid itself, supporting conditional formatting (e.g., heatmaps for high concentrations).
*   **Export:** "Export to CSV/Excel" button.

## 4. Error States & Edge Cases
*   **Empty States:** "No careers found. Click here to add your first career."
*   **Loading States:** Skeleton loaders for tables and charts to prevent layout shift.
*   **Error Handling:** Toast notifications (red) for API failures (e.g., "Failed to save career changes").
*   **Access Denied:** Unauthorized users accessing `/admin` should be redirected to a 403 Forbidden page or the login screen with an error toast.
