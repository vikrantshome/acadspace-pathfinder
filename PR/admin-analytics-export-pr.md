# Pull Request: Admin Analytics Dashboard & Data Export Enhancement

## Description
This PR implements a high-performance Analytics Dashboard for administrators and enhances the data export capabilities to provide comprehensive student data.

### Key Changes
#### Backend
- **DTO**: Created `ReportSummaryDTO` to include additional student context (Active status, Full Name, Parent Name, etc.).
- **Service**: Updated `AdminService` to populate the new fields from the `User` and `Report` models.
- **Controller**: Enhanced `AdminController` with the `/analytics/reports-summary` endpoint for paginated data retrieval.
- **Security**: Refined URL patterns to consistently use `/api/admin/**` for administrative endpoints.

#### Frontend
- **Analytics Page**: Implemented a high-performance data grid using `@visactor/vtable` (VTable) for smooth handling of large datasets.
- **Export Functionality**: Added an "Export All" feature that generates an Excel file containing all requested student data fields, including the top 3 career buckets.
- **Components**: Added `AdminLayout` and `ProtectedRoute` (Admin-specific) to manage administrative access and layout.
- **VTable Integration**: Configured column freezing, sorting, and global filtering for the analytics grid.

### New Fields Added to Export/Grid
- **Email, Student ID, Mobile No**
- **Name, Active Status, Full Name, Parent Name**
- **School Name, Grade, Board, City, State**
- **Career Bucket 1, 2, and 3** (Replaced "Top Careers")
- **Created At, Updated At**
- **Vibe (RIASEC) Scores**

## Verification
- Verified admin login with default credentials (`admin@naviksha.ai` / `admin123`).
- Confirmed analytics data loads correctly via the new paginated endpoint.
- Validated Excel export contains all requested fields and reflects the current filter/page state.

## Repository Changes
- Standardized documentation layout by moving core docs to `document/master/` and `document/milestone/`.
