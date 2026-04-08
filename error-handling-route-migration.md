# Migrate Error Handling In Grades Feedback Fees

## Goal
Apply the shared API error contract to three high-traffic routes and validate they compile and lint cleanly.

## Tasks
- [x] Update [src/app/api/grades/route.ts](src/app/api/grades/route.ts) to use shared error helpers and explicit request validation. -> Verify: route returns typed error payloads for invalid input and uses centralized catch handling.
- [x] Update [src/app/api/feedback/route.ts](src/app/api/feedback/route.ts) to use shared error helpers and validate feedback type/rating/targetId. -> Verify: invalid payloads return 400 with stable code/message.
- [x] Update [src/app/api/fees/route.ts](src/app/api/fees/route.ts) to use shared error helpers and validate status/dates/amounts. -> Verify: malformed date and bad status are rejected with 400.
- [x] Run typecheck for the whole project. -> Verify: `bunx tsc --noEmit` exits with code 0.
- [x] Run targeted lint for edited files. -> Verify: `bunx eslint src/app/api/grades/route.ts src/app/api/feedback/route.ts src/app/api/fees/route.ts` exits with code 0.

## Done When
- [x] All three routes use [src/lib/api-errors.ts](src/lib/api-errors.ts) consistently.
- [x] Validation and error mappings are explicit in all migrated handlers.
- [x] Typecheck and lint pass for this migration scope.
