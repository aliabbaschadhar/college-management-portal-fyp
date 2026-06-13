# Viva Cheat Sheet (Examiner Quick Lookup)

This cheat sheet maps typical questions the viva examiner might ask to the exact file paths and code components in your workspace. Keep this document open during your project defense.

---

## 1. Database & Schema Configuration

### Q: "Show me where your database tables and relations are defined."
* **File Path**: [schema.prisma](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/prisma/schema.prisma)
* **What to show**: Scroll down to view structural models like `User`, `Student`, `Faculty`, `Course`, `Grade`, `Attendance`, `Quiz`, and `AuditLog`.

### Q: "Where is the connection to the database established?"
* **File Path**: [prisma.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/prisma.ts)
* **What to show**: Show how the singleton `PrismaClient` is initialized to avoid consuming too many database connections in development.

---

## 2. Authentication & Authorization

### Q: "Show me the routing middleware that intercepts and checks user sessions."
* **File Paths**: 
  - [middleware.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/middleware.ts) (Next.js interceptor entrypoint)
  - [proxy.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/proxy.ts) (Route check logic and redirects)

### Q: "Where do you define which pages a Student or a Teacher can visit?"
* **File Path**: [proxy.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/proxy.ts)
* **What to show**: Focus on the `FACULTY_ALLOWED_ROUTES` array (line 13) and `STUDENT_ALLOWED_ROUTES` array (line 25).

### Q: "How are API endpoints protected against unauthorized role requests?"
* **File Path**: [auth-guard.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/auth-guard.ts)
* **What to show**: Explain the `requireRole` wrapper, which checks the role claim and throws `403 Forbidden` if unauthorized.

---

## 3. Faculty Features & Grading

### Q: "Where is the code that tallies marks and calculates student GPA?"
* **File Path**: [route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/grades/route.ts)
* **What to show**: Lines 201-204:
  ```typescript
  const total = body.quizMarks + body.assignmentMarks + body.midMarks + body.finalMarks;
  const gpa = +Math.min(4.0, (total / 40) * 4.0).toFixed(2);
  ```

### Q: "Show me where the grades table input sheet is rendered."
* **File Path**: [grades/page.tsx](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/dashboard/grades/page.tsx)
* **What to show**: Locate the table cells with `input` tags and `onChange` handlers for Mid exam, Sessional marks, and CGPA.

### Q: "Show me how you restrict teachers to only see their own department's students."
* **File Path**: [route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/students/route.ts)
* **What to show**: Scroll down to the `FACULTY` conditional checks where we query the DB to filter students matching the teacher's department code or course registrations.

---

## 4. Quizzes & Question Banks

### Q: "How do you prevent students from cheating by inspecting the quiz API response?"
* **File Path**: [route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/quizzes/[id]/route.ts)
* **What to show**: Show how we exclude the `correctOption` from the JSON payload when a student fetches active quiz questions.

### Q: "Where are quiz answers evaluated and stored?"
* **File Path**: [submit/route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/quizzes/[id]/submit/route.ts)
* **What to show**: Explain the server-side grading logic, which fetches correct answers directly from the database, compares user answers, and writes a single `QuizAttempt` score record.

---

## 5. Timetable Scheduler

### Q: "How do you prevent booking conflicts when scheduling classes?"
* **File Path**: [timetable.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/timetable.ts)
* **What to show**: Explain the conflict checking query which runs a search in the `Timetable` model to ensure that:
  - The same room is not booked twice in the same slot.
  - The same teacher is not scheduled to teach two different classes at the same time.

---

## 6. Miscellaneous Components

### Q: "Where is the public QR card scan page that works without user authentication?"
* **File Path**: [verify/[userId]/page.tsx](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/verify/%5BuserId%5D/page.tsx)
* **What to show**: Point out that this page is excluded from auth checks in `proxy.ts` (line 9) so examiners can scan it directly.

### Q: "Where is the global navigation progress loader component rendered?"
* **File Path**: [DashboardShell.tsx](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/components/dashboard/DashboardShell.tsx)
* **What to show**: Focus on the top-level loading progress bar block rendered dynamically at the top of the viewport when `isNavigating` is set to true.
