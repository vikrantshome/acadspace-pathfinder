# Pull Request: Profile Page Real Data Integration

## Branch Name
`feat/profile-real-data`

## Description
This PR addresses several critical issues on the Profile (`/profile`) page where hardcoded dummy data and sample reports were being displayed instead of the authenticated user's actual progress and personalized career report. 

The profile page now dynamically fetches real test progress and report data from the Java backend APIs, adapting its UI based on the user's current status and handling legacy reporting behaviors.

## Key Changes
1. **Real Data Integration:**
   - Removed `sample_report_Aisha` static fallback for RIASEC traits, career buckets, and AI insights.
   - Wired up `apiService.getProgress()` to fetch objective progression for `vibematch` and `edustats` tests.
   - Wired up `apiService.getUserReports()` to display the primary career report.

2. **Test Progress & History:**
   - Replaced hardcoded `testsCompleted` (2/3) with computed metrics derived from real pipeline execution.
   - Dynamically constructed `testHistory` array, tagging tests dynamically with `Completed`, `In Progress`, or `Pending`.
   - Removed hardcoded "92%" / "88%" test score UI in favor of standard completion states.

3. **Backend Data Mapping Fixes:**
   - Fixed `vibe_scores` vs `vibeScores` mapping bug: The page now correctly checks for both snake_case and camelCase attributes, mirroring the logic in `ReportViewer.tsx`.

4. **Empty States & Graceful Degradation:**
   - Instead of defaulting to fake data when reports don't exist, the UI now features clean empty states that guide the user to begin their assessments.
   - The "Settings" tab Education Level now safely handles null assignments, preventing UI crashes.

5. **Quick Actions Overhaul:**
   - Replaced hardcoded dummy "Quick Actions" buttons.
   - The primary action natively detects state (`Start Assessment` -> `Resume Personality Test` -> `Continue to Academic Test` -> `View Full Report`).
   - "Download Report" and "View Results" strictly render only when a verified backend report is available.
   - "Change Password" and "Delete Account" buttons removed as they lack backend endpoints; "Update Profile" correctly opens the `ProfileEditor`.

## Testing Instructions
1. Log in with a student account that has no assessments taken.
2. Navigate to the Profile page and verify clear empty states requesting assessment starts.
3. Log in with an account containing a finalized report (e.g., student ID `AA4547`).
4. Ensure real RIASEC scores and specific top career paths reflect personal data.
5. Verify that checking "Download Report" directly opens the unique generated PDF.
6. Check Account Settings section functions with standard Modal. 

## Related Screenshots / Validation
- TypeScript strictly enforces build constraints (`tsc --noEmit` validates clean).
