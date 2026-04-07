# Student Dashboard Data Integration Plan

**Goal:** Replace static `mock-data.ts` usage in the Student Dashboard with actual Prisma database queries.

**Architecture:** Create a server-side service (`src/lib/services/student.ts`) that handles complex Prisma queries to compose the required dashboard data for a student. Refactor `StudentDashboardHome` to accept this data as props instead of importing mock data directly. Update `src/app/dashboard/page.tsx` to handle the data fetching and pass it to the client component.

**Tech Stack:** Next.js (App Router), Prisma, PostgreSQL, React (Client/Server Components).

## User Review Required

> [!WARNING]
> This plan will change `StudentDashboardHome` signature, ensuring it only relies on props. This enforces a strict Server Component Data Fetching -> Client Component Rendering pattern. 
> Please review the structure to ensure you approve of placing data-fetching logic inside `src/lib/services/student.ts` rather than directly in the server component.

---

### Task 1: Create Student Service for Database Queries

**Files:**
- Create: `src/lib/services/student.ts`

**Step 1: Write the implementation**
Create a comprehensive query function `getStudentDashboardData(clerkUserId: string)` that returns all necessary stats, courses, timetable, quizzes, and announcements.
```ts
import prisma from "@/lib/prisma";

export async function getStudentDashboardData(clerkUserId: string) {
  // Fetch user -> student record
  // Fetch enrollments, courses, attendance, grades, fees, etc.
  // Process and return exact shapes needed by dashboard (e.g. attendanceChartData, pendingQuizzes).
}
```

**Step 2: Verify types**
Run: `bunx tsc --noEmit`
Expected: PASS

**Step 3: Commit**
```bash
git add src/lib/services/student.ts
git commit -m "feat: add robust robust prisma data fetching service for student dashboard

Co-Authored-By: Claude Sonnet 4 <noreply@example.com>"
```

---

### Task 2: Refactor `StudentDashboardHome` Client Component

**Files:**
- Modify: `src/components/dashboard/StudentDashboardHome.tsx`

**Step 1: Update implementation**
Refactor the component to remove all `mock-data.ts` imports.
Accept a `dashboardData` prop containing all pre-processed data.
```tsx
"use client";

// ... imports ...

export function StudentDashboardHome({ dashboardData }: { dashboardData: any }) {
   const { stats, courses, timetable, pendingQuizzes, studentAnnouncements, todayClasses, attendanceChartData, gradeChartData } = dashboardData;
   // Render using props...
}
```

**Step 2: Verify linting**
Run: `bunx next lint`
Expected: PASS

**Step 3: Commit**
```bash
git add src/components/dashboard/StudentDashboardHome.tsx
git commit -m "refactor: update student dashboard to accept data as props

Co-Authored-By: Claude Sonnet 4 <noreply@example.com>"
```

---

### Task 3: Integrate Server Fetching in `page.tsx`

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Implement server fetching**
Import `getStudentDashboardData` and pass the data to `StudentDashboardHome`. Handle the case where the user has no student profile.
```tsx
import { getStudentDashboardData } from "@/lib/services/student";

// ... inside DashboardPage ...
if (role === "student") {
  const data = await getStudentDashboardData(user.id);
  if (!data) return <div>Student profile not found. Please contact administration.</div>;
  return <StudentDashboardHome dashboardData={data} />;
}
```

**Step 2: Build verification**
Run: `bun run build`
Expected: PASS

**Step 3: Commit**
```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: fetch and pass real student dashboard data

Co-Authored-By: Claude Sonnet 4 <noreply@example.com>"
```
