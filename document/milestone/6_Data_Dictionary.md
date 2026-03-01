# 6. Data Dictionary / Schema Doc

**Document Status:** Draft
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Backend Engineer
**Last Updated:** February 2026

## Overview
This document outlines any database schema changes required for the Admin Dashboard milestone.

## Current State Assessment
The existing MongoDB collections (`users`, `careers`, `reports`, `admin_audit`) are largely sufficient for the functional requirements of the Admin Dashboard.

## Schema Modifications

### 1. `users` Collection
*   **No new fields required.**
*   Ensure that the `roles` array properly supports and persists `"ROLE_ADMIN"` for designated administrative accounts.

### 2. `careers` Collection
*   **No new fields required.**
*   All existing fields (`careerId`, `careerName`, `bucket`, `riasecProfile`, `tags`, etc.) will be exposed via the CRUD interface.

### 3. `admin_audit` Collection
*   **No new fields required.**
*   Ensure the Admin Dashboard components log actions (e.g., updating a career) by hitting the appropriate backend endpoints, which automatically insert records into this collection.

## Data Mapping for Pivot Table
For the Pivot Table, the frontend will map data from the `reports` and `users` collections. 
*   **Source Data:** `StudentReport` embedded object inside the `reports` collection.
*   **Dimensions to Expose to Pivot:**
    *   `StudentReport.grade`
    *   `StudentReport.board`
    *   `User.state` / `User.city`
    *   `StudentReport.top5Buckets[0].bucketName` (Primary Career Match)
    *   `StudentReport.aiEnhanced`
