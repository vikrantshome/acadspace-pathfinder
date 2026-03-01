# 13. User Stories & Backlog

**Document Status:** Active
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Product Manager
**Last Updated:** February 2026

## Overview
This document tracks the Agile User Stories that define the functional requirements of the Admin Dashboard from the perspective of the end-user (The System Administrator).

## Sprint 1: Infrastructure & Core CRUD (Completed)
| ID | As a... | I want to... | So that I can... | Status |
| :--- | :--- | :--- | :--- | :--- |
| US-01 | System Admin | Log in via a dedicated admin portal using my email and password | Bypass the student phone/ID lookup flow and access protected areas securely. | **Done** |
| US-02 | System Admin | View high-level KPI cards on a dashboard | Quickly assess the health and usage of the platform (Total Users, Reports). | **Done** |
| US-03 | Operations Manager | View a list of all available careers in the database | Audit the current offerings. | **Done** |
| US-04 | Operations Manager | Add, edit, or delete a career via a user-friendly form | Keep the career recommendations up to date without needing to write database scripts. | **Done** |
| US-05 | Compliance Officer | View a read-only table of audit logs | Track which admin user made changes to the database and when. | **Done** |

## Sprint 2: Advanced Analytics (In Progress)
| ID | As a... | I want to... | So that I can... | Status |
| :--- | :--- | :--- | :--- | :--- |
| US-06 | Data Analyst | View a highly performant data grid of all student reports | See extensive details (RIASEC scores, city, grade, top matches) in one place. | **Done** |
| US-07 | Data Analyst | Paginate through server-side data | Load tens of thousands of records without crashing my browser. | **Done** |
| US-08 | Data Analyst | Select how many rows are visible per page (e.g., 50, 100, 500) | Adjust the density of information on my screen. | *To Do* |
| US-09 | Data Analyst | Choose how many columns are "frozen" on the left side of the grid | Keep important identifiers (like Name and ID) visible while scrolling horizontally through dozens of data points. | *To Do* |
| US-10 | Data Analyst | Filter and search data within specific columns | Quickly find a specific student or narrow down the loaded page to a specific Grade or Board. | *To Do* |
| US-11 | Data Analyst | Export the currently loaded data grid to an Excel file | Perform deeper pivot table analysis natively in Excel. | **Done** |
| US-12 | System Admin | View the analytics grid with a collapsed or narrower sidebar | Maximize the horizontal screen real estate for the wide data table. | *To Do* |

## Sprint 3: Backlog (Future Enhancements)
| ID | As a... | I want to... | So that I can... | Status |
| :--- | :--- | :--- | :--- | :--- |
| US-13 | Data Analyst | Save specific VTable filter and column views | Return to my favorite reports without reconfiguring the grid every time. | *Backlog* |
| US-14 | Operations Manager | Select multiple users and click "Recompute Reports" | Update older student reports when the underlying AI logic or career database changes. | *Backlog* |
| US-15 | System Admin | Perform true server-side column filtering (MongoDB Aggregation) | Filter across the entire 100k+ user database, rather than just the currently loaded page. | *Backlog* |
