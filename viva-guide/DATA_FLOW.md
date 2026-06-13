# Data Flow Explanation

To explain your project effectively in the viva, you must be able to trace how data flows between the user's browser, your server code, and the database. 

This document explains the general data flow architecture and traces a concrete example: **A Teacher saving Mid & Sessional Grades for a Student**.

---

## 1. High-Level Architecture Flow

Your system uses a unidirectional, client-server data flow:

```text
[ Browser UI ] (React Component)
      │
      ▼  (1) Axios Request
[ Axios Client ] (Axios Instance with base URL)
      │
      ▼  (2) HTTP POST/PUT API request
[ Next.js API Route Handler ] (Backend Route)
      │
      ▼  (3) Auth & Permission Validation (Clerk Guard)
[ Route Guard Check ]
      │
      ▼  (4) Business logic & calculations (Grade tallies, GPA checks)
[ Helper utilities ]
      │
      ▼  (5) Prisma Query
[ Prisma Client ORM ] (Singleton Connection)
      │
      ▼  (6) SQL operation
[ PostgreSQL Database ]
```

---

## 2. Step-by-Step Data Flow Example: Saving Student Grades

Let's trace exactly what happens when a Faculty member opens the Grade entry page and saves marks for a student:

### Step 1: User Input in the Frontend Component
* **Where**: [grades/page.tsx](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/dashboard/grades/page.tsx)
* **What**: The teacher types Mid Exam marks (e.g. `22`) and Sessional marks (e.g. `11`) into the input fields in the table, and clicks the **"Save"** button.
* **Logic**: An event handler function `handleSave` is triggered:
  ```typescript
  const handleSave = async (studentId: string, midMarks: number, sessionalMarks: number) => {
    // 1. Sets loading state to true (shows spinner on button)
    // 2. Invokes Axios client
    await api.post("/api/grades", { studentId, courseId, midMarks, sessionalMarks });
  }
  ```

### Step 2: Axios Client Sends the Request
* **Where**: [axios.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/axios.ts)
* **What**: The custom `api` instance wraps the standard Axios client, appending base configurations (such as headers or error parsers) and performs an HTTP POST request to `/api/grades`.

### Step 3: Next.js API Route Handler Receives the Request
* **Where**: [route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/grades/route.ts)
* **What**: The handler parses the request JSON payload containing `studentId`, `courseId`, `midMarks`, and `sessionalMarks`.
* **Security Guard**: The handler immediately verifies user credentials and permissions by calling:
  ```typescript
  const session = await auth(); // Verify request clerk authentication
  await requireRole("FACULTY"); // Enforce that only faculty members can perform this action
  ```

### Step 4: Business Logic & Grade Calculations
* **Where**: [route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/grades/route.ts) and [sync-hooks.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/sync-hooks.ts)
* **What**: The server validates the inputs (e.g., ensuring `midMarks <= 25` and `sessionalMarks <= 15`). It then calculates the GPA and updates the records:
  ```typescript
  // Sums the grades
  const total = midMarks + sessionalMarks; // max 40
  const gpa = calculateGpaOutOf40(total); // computes grade point average
  ```

### Step 5: Prisma ORM Writes to the Database
* **Where**: [route.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/app/api/grades/route.ts) imports the Prisma client from [prisma.ts](file:///home/waqarhassan/Desktop/programming/college-management-portal-fyp/src/lib/prisma.ts)
* **What**: Prisma executes an `upsert` or `update` query:
  ```typescript
  await prisma.grade.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    update: { midMarks, finalMarks: sessionalMarks, total, gpa },
    create: { studentId, courseId, midMarks, finalMarks: sessionalMarks, total, gpa }
  });
  ```
* **Result**: Prisma translates this code into a standard SQL `INSERT/UPDATE` statement and executes it against your **PostgreSQL** database.

### Step 6: Server Returns Response & UI Updates
* **What**: The API route sends a `200 OK` JSON response:
  ```typescript
  return NextResponse.json({ success: true, message: "Grades saved successfully" });
  ```
* **UI Feedback**: The frontend `handleSave` function receives the response, clears the loading state, and displays a success message ("Grades updated successfully") using a Toast notification component.
