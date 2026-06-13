# Directory Structure Guide

The project is built using a modern full-stack directory layout powered by **Next.js (App Router)**, **Prisma ORM**, and **TypeScript**. Understanding how this layout is organized is essential for navigating the codebase and explaining it during your viva.

---

## 1. High-Level Folder Map

Here is a simplified map of the project's root folder:

```text
college-management-portal-fyp/
├── prisma/                    # Database schema and migration scripts
│   ├── schema.prisma          # Database models (PostgreSQL structure)
│   └── migrations/            # SQL migration history files
├── public/                    # Static assets (images, icons, svgs)
├── src/                       # Primary application code
│   ├── app/                   # App Router (pages and api routes)
│   ├── components/            # Reusable UI and layout components
│   ├── hooks/                 # Custom React hooks (state/fetching)
│   ├── lib/                   # Utility helpers and third-party clients
│   ├── types/                 # TypeScript type interfaces
│   ├── utils/                 # General helpers (e.g. role utilities)
│   └── middleware.ts          # Root routing interceptor (entrypoint)
├── package.json               # Dependencies and scripts (dev, build, lint)
├── tsconfig.json              # TypeScript compilation rules
└── docker-compose.yaml        # Local PostgreSQL database services config
```

---

## 2. Deep Dive: `src/app/` (Next.js Routing)

Next.js uses folder-based routing. Inside `src/app/`, there are two types of primary files:
1. **`page.tsx` (Frontend Pages)**: Represents a visible page in the web browser.
2. **`route.ts` (Backend API Endpoints)**: Handles HTTP requests (GET, POST, PUT, DELETE) and acts as your backend controller.

### 2.1 Dashboard Routes (`src/app/dashboard/...`)
These folders contain the visual pages accessible inside the portal dashboard:
* `/dashboard/grades/page.tsx`: Faculty page where teachers enter marks and CGPA.
* `/dashboard/my-grades/page.tsx`: Student page where students view their grade sheets.
* `/dashboard/students/page.tsx`: Faculty page displaying scoped department students.
* `/dashboard/quizzes/page.tsx` & `/dashboard/take-quiz/page.tsx`: Quizzes administration and student exam interfaces.
* `/dashboard/attendance/page.tsx` & `/dashboard/mark-attendance/page.tsx`: Faculty attendance administration.

### 2.2 Backend API Routes (`src/app/api/...`)
These folders contain backend handlers that query the database:
* `/api/grades/route.ts`: API endpoint for reading and writing student grades.
* `/api/students/route.ts`: API endpoint for fetching students (scoped by role).
* `/api/quizzes/[id]/submit/route.ts`: API endpoint for secure server-side quiz grading.
* `/api/attendance/route.ts`: API endpoint for fetching and marking attendance records.

---

## 3. Deep Dive: `src/components/` (UI Elements)

Your user interface is split into reusable components:

### 3.1 Base UI Components (`src/components/ui/`)
Common pre-styled building blocks (mostly managed via Shadcn UI):
* `button.tsx`: Branded button elements.
* `dialog.tsx` / `input.tsx`: Forms and popup modals.
* `spinner.tsx` / `skeleton.tsx`: Loading spinners and placeholder layouts.

### 3.2 Layout & Dashboard Components (`src/components/dashboard/`)
Core dashboard visual templates:
* `Sidebar.tsx`: The left navigation menu displaying items matching the user's role.
* `DashboardShell.tsx`: The parent layout container holding the sidebar, header, page contents, and the top loading progress bar.
* `StudentDashboardHome.tsx` / `FacultyDashboardHome.tsx`: Visual landing dashboards displaying key statistics, Recharts graphs, and recent announcements.

---

## 4. Deep Dive: `src/lib/` (Core Logic)

The `src/lib/` folder contains configurations and functions that support the application:
* `prisma.ts`: Initializes the singleton connection to your PostgreSQL database.
* `auth-guard.ts`: Enforces role checks in your API routes (`requireRole` API wrappers).
* `sync-hooks.ts`: Performs arithmetic calculations (e.g. computing GPA out of 40 marks, checking low-attendance thresholds, calculating course averages).
* `sidebar-config.ts`: Configures which navigation links are visible for `ADMIN`, `FACULTY`, and `STUDENT` roles.
