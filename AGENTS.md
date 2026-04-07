# Agent Instructions

## Package Manager
Use **bun**: `bun install`, `bun run dev`, `bun run build`

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Claude Sonnet 4 <noreply@example.com>
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `bunx tsc --noEmit` |
| Lint | `bunx next lint` |

## Key Conventions
- **Framework:** Next.js (App Router), React Server Components first.
- **UI:** Tailwind CSS (v4), ShadCN UI, Framer Motion.
- **Charts:** Use **ShadCN Charts (Recharts)**. *Do not use Chart.js directly.*
- **Database:** Prisma ORM with PostgreSQL. Always import singleton from `lib/prisma.ts`.
- **Auth:** Clerk. Use `auth()` or `currentUser()` from `@clerk/nextjs/server` for server verification.
- **Typing:** Strict typing mandatory. Never use `any`.

## Domain Context (Read Before Modifying Scope)
- `docs/plans/` -> Active implementation plans
- `.agent/prd.md` -> Feature requirements
- `.agent/architecture.md` -> System boundaries, RBAC, DB schemas
- `.agent/design.md` -> UI/UX tokens and specifications
- `.agent/status.md` -> Project completion status

## CLI
| Command | Description |
|---------|-------------|
| `bunx prisma studio` | Open Prisma Studio |
| `bunx prisma generate` | Generate Prisma Client |
| `bunx prisma migrate dev` | Run migrations |
