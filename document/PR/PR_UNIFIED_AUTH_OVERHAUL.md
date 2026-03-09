# 🚀 feat: Unified Auth Overhaul & Backend Schools API Integration

## Summary
Complete transformation of the authentication experience into a unified, high-performance `Auth` container. This overhaul introduces a sliding state transition between Login and SignUp, a fully redesigned registration flow with intelligent data-driven dropdowns, and a new backend service for dynamic school list retrieval with robust frontend fallbacks.

---

## Changes

### 🔐 Unified Auth Experience
- **`Auth.tsx` Container** — Introduced a single entry point for all authentication routes (`/login`, `/register`, `/auth`) with shared state management.
- **Sliding State Transitions** — Smooth, high-fidelity animations when switching between login and registration, eliminating page reloads and preserving user context.
- **Route Consolidation** — Updated `App.tsx` to map multiple legacy routes to the new high-performance `Auth` architecture.

### 📝 Registration Flow Redesign (`SignUp.tsx`)
- **Interactive Searchable Dropdowns** — Replaced static inputs with high-performance searchable components for:
  - **School/College Name** — Powered by the new backend API.
  - **State & City** — Intelligent cascading selection based on geographical data.
  - **Board Selection** — Comprehensive list (CBSE, ICSE, IB, etc.) with custom "Other" support.
- **Enhanced Data Integrity** — Implemented strict validation and formatting for mobile numbers, emails, and grade levels.
- **Responsive Form Engineering** — Optimized for both mobile and desktop with a focus on ease of input and accessibility.

### 🏛️ Backend Integration
- **`SchoolController.java`** — New service layer to expose verified school/college datasets to the public registration flow.
- **`SecurityConfig.java`** — Updated permit-all policies to allow unauthenticated access to the school lookup endpoint, ensuring zero friction during the signup process.
- **Frontend Resiliency** — Added `FALLBACK_SCHOOLS` in `api.ts` to ensure a seamless experience even during backend maintenance or network instability.

### 🎨 Assets & Branding
- **New `logo.png`** — Integrated the latest brand assets into the public `public/` directory.

---

## Files Impacted

| File | Type | Description |
|---|---|---|
| `src/pages/Auth.tsx` | **New** | Unified high-performance Auth container. |
| `backend/src/main/java/com/naviksha/controller/SchoolController.java` | **New** | Backend service for school list retrieval. |
| `public/logo.png` | **New** | New official brand asset. |
| `src/App.tsx` | Modified | Updated routing logic for unified Auth. |
| `src/lib/api.ts` | Modified | Added `getSchools` method & robust fallback mechanism. |
| `src/pages/Login.tsx` | Modified | Refactored for integration with `Auth.tsx` state. |
| `src/pages/SignUp.tsx` | Modified | Complete redesign with searchable dropdowns & API integration. |
| `backend/src/main/java/com/naviksha/config/SecurityConfig.java` | Modified | Updated security policies for public school lookup. |

---

## Verification Checklist

- [x] **Unified Routing** — `/login` and `/register` both correctly load the `Auth` container.
- [x] **State Transitions** — Switching between Login and SignUp is smooth with no UI flickering.
- [x] **School Lookup API** — Successfully fetches school list; verifies fallback mechanism when API is unavailable.
- [x] **Searchable Dropdowns** — Filtering logic works correctly across School, State, City, and Board fields.
- [x] **Mobile Responsive** — Verified vertical stacking and input accessibility on mobile viewports.
- [x] **Security** — Confirmed `/api/schools` is accessible without a JWT token during registration.

---

## How to Test

```bash
# Start backend
cd backend
mvn spring-boot:run

# Start frontend
npm run dev
```

1. Navigate to `http://localhost:8080/register`.
2. Observe the new searchable dropdowns.
3. Select a State and verify that the City list updates dynamically.
4. Search for a school and confirm results appear.
5. Click "Sign In" at the bottom and observe the sliding transition to the Login view.
