# 7. Test Plan & Test Cases

**Document Status:** Draft
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** QA Engineer
**Last Updated:** February 2026

## Overview
This document outlines the testing strategy to ensure the Admin Dashboard meets all functional and non-functional requirements safely.

## 1. Authentication & Authorization
| Test ID | Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| AUTH-01 | Admin user logs in. | Successfully routes to `/admin/dashboard`. | |
| AUTH-02 | Standard user attempts to access `/admin/dashboard`. | Redirected to `/` or 403 Forbidden. | |
| AUTH-03 | Unauthenticated user attempts to access `/admin/dashboard`. | Redirected to login page. | |

## 2. Career Management (CRUD)
| Test ID | Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| CAR-01 | Admin views the career grid. | Table populates with careers from DB. | |
| CAR-02 | Admin creates a new valid career. | Success toast appears; new career is in grid. | |
| CAR-03 | Admin edits an existing career's tags. | Success toast; updated data persists on reload. | |
| CAR-04 | Admin deletes a career. | Confirmation modal appears; upon confirm, career is removed. | |
| CAR-05 | Admin checks Audit Logs after deleting. | A new entry exists for "DELETE_CAREER". | |

## 3. Pivot Table Analytics
| Test ID | Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| PIV-01 | Load Pivot Table view. | Table loads within 3 seconds. | |
| PIV-02 | Drag 'Grade' to Rows and 'Top Bucket' to Columns. | Grid dynamically calculates the count of users matching the intersection. | |
| PIV-03 | Export Pivot Table. | A valid CSV/Excel file is downloaded reflecting the current grid state. | |

## 4. UI/UX
| Test ID | Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- |
| UI-01 | View dashboard on mobile device. | Sidebar collapses; tables scroll horizontally. | |
| UI-02 | Toggle dark mode. | Entire admin interface shifts to dark theme without text legibility issues. | |
