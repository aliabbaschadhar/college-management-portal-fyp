# Populate Mock Data for Screenshots

## Goal
Seed the PostgreSQL database with rich mock data and ensure the current user can access all dashboards (Admin, Student, Faculty) with fully populated UI and charts for taking screenshots.

## Tasks
- [ ] Task 1: Create a specialized seed script (`prisma/seed-for-screenshots.ts`) that imports `mock-data.ts` and populates the database while associating your actual Clerk ID with one Admin, one Student, and one Faculty profile. → Verify: Script exists and is valid.
- [ ] Task 2: Reset the local database to ensure a clean slate without conflicting data. → Verify: Run `bunx prisma migrate reset --force`.
- [ ] Task 3: Execute the new seed script to populate the database. → Verify: Run `bunx prisma db seed` (or execute the script directly) and see success output.
- [ ] Task 4: Verify the UI state by running the dev server (`bun run dev`) and navigating to the Admin, Student, and Faculty dashboards. → Verify: Charts, tables, and stats are no longer empty.

## Done When
- [ ] Admin Dashboard shows populated charts for "Students per Department" and "Attendance Overview".
- [ ] Tables for students, courses, attendance, and fees have entries.
- [ ] User can freely navigate the UI to take screenshots of all sections as a "finished product".
