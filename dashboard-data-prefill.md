# Prefill Dashboard Data

## Goal
Fix 401 and 404 errors on the Admin, Faculty, and Student dashboards by implementing mock-data fallbacks when the Clerk user ID isn't found, and prevent undefined crashes in the UI.

## Tasks
- [x] Task 1: Update `src/app/api/dashboard/student/route.ts` to fallback to the first seeded `STUDENT` user if the current Clerk ID isn't found. → Verify: Load `/dashboard/student` and see data instead of 404.
- [x] Task 2: Update `src/app/api/dashboard/faculty/route.ts` to fallback to the first seeded `FACULTY` user. → Verify: Load `/dashboard/faculty` and see data.
- [x] Task 3: Update `src/app/api/dashboard/admin/route.ts` to fallback to the first seeded `ADMIN` user. → Verify: Load `/dashboard/admin` and see data.
- [x] Task 4: Update `src/app/api/courses/route.ts` to use fallback logic if `user` isn't found (instead of returning 401). → Verify: `/dashboard/my-courses` loads without errors.
- [x] Task 5: Add safe optional chaining `?.` in frontend dashboard page components (`src/app/dashboard/...`) to gracefully handle null/undefined data properties. → Verify: Dashboard renders a skeleton/empty state instead of crashing if data is missing.

## Done When
- [x] Logging into the application with any Clerk account correctly displays prefilled mock data on all three dashboards.
- [x] No 401 or 404 console errors when fetching dashboard data.
- [x] The dashboard UI does not crash with "undefined" errors under any circumstances.
