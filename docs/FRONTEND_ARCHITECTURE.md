# Frontend Architecture - Naviksha / AcadSpace Pathfinder

This document provides an in-depth look into the architectural design and key patterns implemented in the Naviksha / AcadSpace Pathfinder frontend application.

## 1. Directory Structure

The project adheres to a logical, feature-based directory structure to promote maintainability and scalability.

-   **`src/components`**: This directory houses all reusable UI components.
    -   **`src/components/ui`**: This subdirectory specifically contains UI components generated and managed by [Shadcn UI](https://ui.shadcn.com/). These are often styled with Tailwind CSS and act as the foundational building blocks for the application's visual interface. Examples include `button.tsx`, `dialog.tsx`, `input.tsx`, etc.
    -   **Other subdirectories within `src/components`**: These typically contain more complex, application-specific components that compose `ui` components. Examples include `CareerCard.tsx`, `ProgressBar.tsx`, `AuthProvider.tsx`, and `JourneyTracker.tsx`. These components are designed to be reusable across different pages or sections of the application.
-   **`src/pages`**: This directory contains components that represent distinct views or routes within the application. Each file (`.tsx`) usually corresponds to a top-level route.
    -   **`src/pages/NcciAllen`**: This is an example of a feature-specific sub-application or a dedicated landing page within the main application, having its own internal structure, components, and pages. This indicates a modular approach for larger, distinct sections.
-   **`src/lib`**: This directory is for core logic, utility functions, and service integrations.
    -   **`api.ts`**: Centralizes all interactions with the backend API. It implements a singleton `ApiService` class for consistent authentication and request handling.
    -   **`utils.ts`**: Contains general-purpose utility functions that don't belong to a specific component or service, such as helper functions for data manipulation or formatting.
    -   **`puppeteer-pdf-generator.ts`**: This module acts as a client to an external Puppeteer microservice. It sends report data to the service, which then generates the PDF and returns a link to the generated file.
    -   **`excel-export.ts`**: Logic for exporting data to Excel format.
    -   **`scoring.ts`**: Contains the logic related to the RIASEC scoring model and assessment calculations.
-   **`src/hooks`**: Custom React hooks are defined here. These hooks encapsulate reusable stateful logic or side-effects, promoting code reuse and separation of concerns (e.g., `use-mobile` for responsive design logic, `use-toast` for displaying notifications).
-   **`src/types`**: This directory is crucial for type safety in a TypeScript project. It defines all custom TypeScript interfaces and types (`.ts`) used throughout the application, such as `User`, `Career`, `Question`, `StudentReport`, etc.
-   **`public`**: Contains static assets (e.g., `favicon.ico`, `placeholder.svg`, `robots.txt`) that are served directly by the web server without being processed by Vite.

## 2. Routing

The application leverages `react-router-dom` for client-side routing, enabling a single-page application experience.

-   **`BrowserRouter`**: Wraps the entire application's routing logic, enabling HTML5 history API for clean URLs.
-   **`Routes`**: A container for `Route` components, it renders the first child `<Route>` that matches the current URL.
-   **`Route`**: Defines individual routes, mapping a `path` to an `element` (React component).
    -   **Dynamic Routes**: The application uses dynamic segments (e.g., `/test/:testType`, `/report/:reportId`) to pass parameters to components.
    -   **Auth-Protected Routes**: While not explicitly shown in `App.tsx` directly, the `AuthProvider` likely plays a role in protecting routes or rendering different content based on authentication status. This typically involves wrapping routes or components with a HOC (Higher-Order Component) or using conditional rendering within components.
    -   **Catch-all Route**: The `<Route path="*" element={<NotFound />} />` serves as a fallback for any unmatched URLs, directing users to a 404 page.

## 3. State Management

The application employs a hybrid approach to state management, combining React's Context API for global authentication state and TanStack Query for server-side data management.

-   **Authentication State (React Context API with `AuthProvider`)**:
    -   **`AuthProvider` (`src/components/AuthProvider.tsx`)**: This component wraps a significant portion of the application tree. It uses React's Context API to manage the user's authentication status (logged in/out), the JWT token, and user profile data.
    -   **Purpose**: Ensures that authentication-related data is globally accessible to any component without prop-drilling. It typically handles storing the token in `localStorage`, providing methods for login/logout, and making the current user's data available via a custom hook (e.g., `useAuth`).
    -   **Usage**: Components requiring authentication status or user data consume this context, often via a custom hook provided by the `AuthProvider` itself.

-   **API (Server) State (TanStack Query)**:
    -   **`QueryClientProvider`**: Wraps the application to provide a `QueryClient` instance, which manages caching, re-fetching, and synchronization of server-side data.
    -   **Purpose**: Simplifies data fetching from the backend by abstracting away complex caching, background updates, and error handling logic. It turns asynchronous data fetching into a synchronous-looking API.
    -   **Usage**:
        -   **`useQuery`**: Used for fetching data (e.g., `useQuery(['tests'], apiService.getTests)`). It automatically handles loading states, error handling, and data caching.
        -   **`useMutation`**: Used for performing data modifications (e.g., `useMutation(apiService.submitTest)`). It handles optimistic UI updates, error handling for mutations, and invalidating related queries to trigger re-fetches.
    -   **Benefits**: Reduces boilerplate code for data fetching, improves perceived performance with instant UI updates (optimistic updates), and ensures data freshness.

## 4. Component Structure and Design Patterns

The application follows a component-based architecture, heavily influenced by React best practices and modern UI frameworks.

-   **Shadcn UI Integration**: The `src/components/ui` directory is a direct implementation of Shadcn UI components. These are headless, accessible UI primitives that are styled with Tailwind CSS, providing a consistent and customizable design system. Components in `src/components` then compose these `ui` components.
-   **Composition over Inheritance**: Components are built by composing smaller, more focused components. For example, a `CareerCard` might compose `Badge`, `Button`, and `AlertDialog` components from `src/components/ui`.
-   **Separation of Concerns**: Logic related to data fetching, state management, and side effects is often extracted into custom hooks (`src/hooks`) or services (`src/lib/api.ts`), keeping components focused on rendering UI.
-   **Responsive Design**: The presence of `use-mobile` hook in `src/hooks` suggests an emphasis on responsive design, adapting the UI for various screen sizes (e.g., mobile, tablet, desktop).

## 5. API Service Design (`src/lib/api.ts`)

The `ApiService` class in `src/lib/api.ts` is a cornerstone of the frontend's interaction with the backend.

-   **Singleton Pattern**: By exporting a single instance (`export const apiService = new ApiService();`), the application ensures that all parts of the frontend share the same API service instance. This is crucial for maintaining a consistent authentication state (the `token`) across all requests.
-   **Authentication Handling**:
    -   The `token` is loaded from `localStorage` upon instantiation.
    -   The `getHeaders()` method dynamically adds the `Authorization` header with the JWT `Bearer` token for authenticated requests.
    -   Login (`login`), registration (`register`), and token persistence (`setAuth`) methods manage the `token` in both the service instance and `localStorage`.
-   **Centralized Error Handling (`handleResponse`)**:
    -   This private method intercepts all API responses.
    -   It checks for non-2xx HTTP status codes and parses the error message from the response body, providing a consistent way to handle and display API errors throughout the application.
    -   It gracefully handles empty responses or non-JSON content types.
-   **Structured API Methods**: The class provides well-defined asynchronous methods for each backend endpoint, categorized logically (Authentication, Tests, Progress, Reports, Profile, Health Check, OTP, AI Service). This makes API interactions predictable and type-safe.

By adhering to these architectural principles, the Naviksha / AcadSpace Pathfinder frontend aims to be maintainable, scalable, performant, and robust.