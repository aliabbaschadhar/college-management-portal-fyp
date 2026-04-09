# Setup Screenshot Data

## Goal
Seed the PostgreSQL database with rich mock data mapped to your specific Clerk UserIDs so that dashboards are fully populated for screenshots.

## Tasks
- [ ] Task 1: Modify `prisma/seed.ts` to use provided Clerk IDs for Admin, Student (s1), and Faculty (f1) → Verify: File contains new IDs.
- [ ] Task 2: Run `bunx prisma migrate reset --force` → Verify: Command completes and reports "Database seeded successfully".
- [ ] Task 3: Open `bunx prisma studio` → Verify: Locate the `User` table and confirm the records exist with your Clerk IDs.
- [ ] Task 4: Navigate to `/dashboard` in the browser → Verify: Stats cards and charts show data for Admin, Student, and Faculty roles.

## Done When
- [ ] Your specific Clerk IDs are records in the database.
- [ ] Admin dashboard shows "Students per Department" and "Attendance" charts.
- [ ] Student dashboard for Ali Abbas shows GPA and Course stats.
- [ ] Faculty dashboard for Dr. Khalid Mahmood shows Course and Feedback stats.
