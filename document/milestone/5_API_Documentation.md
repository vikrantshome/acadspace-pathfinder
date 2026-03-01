# 5. API Documentation (Admin Endpoints)

**Document Status:** Draft
**Project:** AcadSpace Pathfinder - Admin Dashboard Milestone
**Owner:** Backend Engineer
**Last Updated:** February 2026

## Overview
This document outlines the API endpoints utilized by the Admin Dashboard. Most endpoints already exist within the `AdminController`.

## Authentication
All endpoints require a valid JWT token in the Authorization header. The token must correspond to a user with the `ROLE_ADMIN` role.

`Authorization: Bearer <token>`

---

## 1. Analytics & Stats

### 1.1 Get System Stats
*   **Endpoint:** `GET /admin/stats`
*   **Description:** Retrieves high-level KPIs for the overview dashboard.
*   **Response (200 OK):**
    ```json
    {
      "totalUsers": 1500,
      "totalTestsTaken": 1200,
      "totalReportsGenerated": 1150
    }
    ```

### 1.2 Get Reports Summary (Proposed New Endpoint)
*   **Endpoint:** `GET /admin/analytics/reports-summary`
*   **Description:** Returns a flat array of anonymized report data optimized for the client-side Pivot Table.
*   **Response (200 OK):**
    ```json
    [
      {
        "studentID": "STU123",
        "grade": 10,
        "board": "CBSE",
        "state": "Maharashtra",
        "topBucket": "Technology",
        "aiEnhanced": true
      }
    ]
    ```

---

## 2. Career Management

### 2.1 List All Careers
*   **Endpoint:** `GET /admin/careers`
*   **Description:** Retrieves all careers for the data grid.

### 2.2 Add Career
*   **Endpoint:** `POST /admin/careers`
*   **Body:** `Career` Object

### 2.3 Update Career
*   **Endpoint:** `PUT /admin/careers/{careerId}`
*   **Body:** `Career` Object

### 2.4 Delete Career
*   **Endpoint:** `DELETE /admin/careers/{careerId}`

---

## 3. System Audit

### 3.1 Get Audit Logs
*   **Endpoint:** `GET /admin/audit?page=0&size=50`
*   **Description:** Paginated retrieval of admin actions.
