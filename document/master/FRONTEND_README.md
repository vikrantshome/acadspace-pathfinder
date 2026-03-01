# Naviksha / AcadSpace Pathfinder - Frontend Documentation

This document provides a comprehensive overview of the frontend architecture, setup, and core features of the AcadSpace Pathfinder application.

## 1. Project Overview

AcadSpace Pathfinder is a modern career assessment platform designed to help students discover their ideal career paths. The application uses the RIASEC (Holland Codes) model to assess a user's personality and interests, matching them with suitable careers. Key features include:

-   **Career Assessment:** A comprehensive test to determine a user's RIASEC profile.
-   **Personalized Reports:** Detailed reports that visualize the user's results and provide career recommendations.
-   **User Authentication:** Secure login and registration for users to save and track their progress.
-   **Report Export:** Functionality to export assessment reports as PDF documents.

The frontend is a single-page application (SPA) built with React, TypeScript, and Vite, interacting with a Spring Boot backend for data persistence and business logic.

## 2. Tech Stack

The frontend is built with a modern and robust tech stack:

-   **Framework:** [React 18](https://reactjs.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **State Management (API):** [TanStack Query](https://tanstack.com/query/latest)
-   **State Management (Auth):** React Context API
-   **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
-   **Charting:** [Recharts](https://recharts.org/)
-   **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) and [html2canvas](https://html2canvas.hertzen.com/)
-   **Linting:** [ESLint](https://eslint.org/)

## 3. Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or higher is recommended)
-   [Bun](https://bun.sh/) or `npm` for package management.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd acadspace-pathfinder
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    # or
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with the correct backend URL.

### Available Scripts

-   **Run the development server:**
    ```bash
    bun run dev
    # or
    npm run dev
    ```
    This will start the Vite development server, typically at `http://localhost:5173`.

-   **Build for production:**
    ```bash
    bun run build
    # or
    npm run build
    ```
    This command bundles the application for production into the `dist` directory.

-   **Lint the codebase:**
    ```bash
    bun run lint
    # or
    npm run lint
    ```
    This runs ESLint to check for code quality and style issues.

## 4. Project Architecture

For a detailed breakdown of the frontend's architecture, including directory structure, routing, state management, and API service design, please refer to the dedicated [Frontend Architecture Documentation](docs/FRONTEND_ARCHITECTURE.md).

## 5. Core Modules & Workflows

### Authentication

The authentication flow is handled by the `ApiService` and `AuthProvider`.

1.  **Registration/Login:** The user provides their credentials on the `Login` or `Auth` page.
2.  **API Call:** The `apiService.login()` or `apiService.register()` method sends a request to the backend.
3.  **Token Storage:** Upon a successful response, the JWT token received from the backend is stored in `localStorage` under the key `auth_token`. User data is stored under `user_data`.
4.  **Authenticated State:** The `AuthProvider` reads the token from `localStorage`, and the `apiService` singleton includes this token in the `Authorization` header for all subsequent authenticated requests.

### Assessment Engine

1.  **Fetching Questions:** The `TestPage.tsx` component fetches the assessment questions from the backend using the `apiService.getTest()` method.
2.  **Answering Questions:** As the user answers questions, their responses are stored in the component's local state.
3.  **Progress Saving:** The application automatically saves the user's progress to the backend via `apiService.saveProgress()`, allowing them to resume the test later.
4.  **Submission:** Once the test is complete, the answers are submitted to the backend using `apiService.submitTest()`.

### Results & Reports

1.  **Fetching Reports:** After completing a test, the user is redirected to the results page, which fetches the generated report using `apiService.getUserReports()` or `apiService.getReport()`.
2.  **Visualization:** The `ReportViewer.tsx` component uses `Recharts` to display the RIASEC scores and other data in a visually appealing format.
3.  **PDF Export:** The "Download PDF" functionality uses `jsPDF` and `html2canvas` to capture the report content from the DOM and generate a downloadable PDF file.

## 6. API Integration

All communication with the Spring Boot backend is centralized in the `ApiService` class (`src/lib/api.ts`).

-   **Singleton Pattern:** The file exports a single instance of the `ApiService`, ensuring that all API calls throughout the application use the same configuration and authentication state.
-   **Authenticated Requests:** The service automatically attaches the JWT token from `localStorage` to the headers of authenticated requests.
-   **Error Handling:** A centralized `handleResponse` method provides consistent error handling for all API calls, parsing error messages from the backend and throwing standardized `Error` objects.

## 7. Environment Variables

The application requires the following environment variables to be set in a `.env` file in the project root:

-   `VITE_BACKEND_BASE_URL`: The base URL of the Spring Boot backend API.
-   `VITE_BACKEND_HEALTH_CHECK_URL`: The URL for the backend health check endpoint.

Example `.env` file:

```
VITE_BACKEND_BASE_URL=http://localhost:8080/api
VITE_BACKEND_HEALTH_CHECK_URL=http://localhost:8080/actuator/health
```
