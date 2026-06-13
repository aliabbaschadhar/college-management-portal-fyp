# Authentication & Role-Based Access Control (RBAC)

Security is a primary concern for any administrative portal. This document details how **Clerk Authentication** and **Role-Based Access Control (RBAC)** are integrated into the College Management Portal to guard access boundaries.

---

## 1. Authentication Engine: Clerk Auth

Rather than building a custom authentication database with complex password hashing, email verification, and password resets, the project leverages **Clerk Auth**.
* **Identity Management**: Handles Sign-in, Sign-up, and multi-factor authentication.
* **Session Storage**: Clerk maintains JSON Web Tokens (JWT) inside browser cookies to track active user sessions.
* **User Synchronization**: To keep our local PostgreSQL database synced with Clerk, we use a webhook endpoint:
  * **File**: [clerk/route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/webhooks/clerk/route.ts)
  * **How it works**: When a user registers or updates their profile on Clerk, Clerk triggers an HTTP POST webhook request to our portal. The handler validates the signature using the `svix` package, parses the payload, and inserts/updates a matching record in the local `User` table (setting the default role as `STUDENT`).

---

## 2. Client-Side Routing Guard: Middleware

To prevent a logged-out user or a student from typing a faculty/admin URL in the browser address bar (e.g., `/dashboard/grades`), we intercept all page navigations using Next.js Middleware.

### 2.1 Middleware Entrypoint
* **File**: [middleware.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/middleware.ts)
* **What**: Re-exports standard matching and execution rules from your proxy file.

### 2.2 Routing Logic
* **File**: [proxy.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/proxy.ts)
* **How it works**:
  1. The middleware matches requests using the config matcher (intercepting dashboard pages and API endpoints).
  2. If the user is unauthenticated and tries to access `/dashboard`, they are redirected to the sign-in page.
  3. If they are logged in, it retrieves the user's role from the Clerk session claims metadata (`sessionClaims.metadata.role`).
  4. It defines allowed path lists for roles:
     * **Faculty allowed paths** (`FACULTY_ALLOWED_ROUTES`): classes, mark-attendance, grades, question-bank, quizzes, feedback, settings, students.
     * **Student allowed paths** (`STUDENT_ALLOWED_ROUTES`): my-courses, my-attendance, my-grades, my-dues, my-timetable, take-quiz, submit-feedback, settings.
     * **Admin**: Has full access, bypassed by role verification check.
  5. If the request pathname is not in the allowed list for the user's role, the middleware redirects them back to `/dashboard`.

---

## 3. Server-Side API Guard: Auth Guards

Frontend routing checks only prevent visual navigation. If a student uses an API client (like Postman) to call a grading endpoint, client-side guards are bypassed. Therefore, **backend API routes must also be secured**.

* **File**: [auth-guard.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/auth-guard.ts)
* **Functions**:
  1. **`requireRole(requiredRole: Role)`**:
     Checks the authenticated session claims. If the user's role does not match the required role (e.g., a student attempts to access a `/api/grades` endpoint requiring `FACULTY`), the execution stops, and it returns a `403 Forbidden` error response.
  2. **`requireOwnerOrRole(ownerUserId: string, requiredRole: Role)`**:
     Used when a resource belongs to a specific user (e.g., updating user settings). It allows execution if the logged-in user is the owner of the record (`userId === ownerUserId`) OR if they hold the override role (e.g. `ADMIN`).
