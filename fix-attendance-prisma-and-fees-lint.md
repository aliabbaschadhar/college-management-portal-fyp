# Fix Attendance Prisma Selector And Fees Lint

## Goal
Resolve current typecheck and lint blockers by removing invalid attendance unique selectors and fixing the mutable fees filter.

## Tasks
- [x] Update attendance seeding logic in prisma/seed.ts to stop using unsupported composite unique upsert selector -> Verify: `bunx tsc --noEmit` no longer reports prisma/seed.ts selector error.
- [x] Update attendance API write logic in src/app/api/attendance/route.ts to stop using unsupported composite unique upsert selector -> Verify: `bunx tsc --noEmit` no longer reports attendance route selector error.
- [x] Refactor src/app/api/fees/route.ts where clause to use immutable `const` construction -> Verify: `bun run lint` no longer reports prefer-const at that file.
- [x] Run validation commands for this fix (`bunx tsc --noEmit`, `bun run lint`) -> Verify: no errors remain from edited files.

## Done When
- [x] Typecheck no longer fails on attendance selector issues.
- [x] Lint no longer fails on fees route prefer-const issue.
- [x] Edited files have no new diagnostics.
