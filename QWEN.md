# QWEN.md — College Management Portal (FYP)

## Project Overview

A full-stack, role-based **College ERP** built as a Final Year Project (FYP) for Govt. Graduate College, Hafizabad (BSCSF2022-2026). The portal centralizes attendance, grades, fees, timetable, quizzes, admissions, announcements, and public QR profile verification for **Students**, **Faculty**, and **Admins**.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript (strict mode, no `any`) |
| **Framework** | Next.js 16 (App Router, React Server Components) |
| **UI** | Tailwind CSS v4, ShadCN UI (New York style), Framer Motion |
| **Charts** | Recharts (ShadCN Charts) — *not Chart.js* |
| **Auth** | Clerk |
| **ORM** | Prisma 7.x with PostgreSQL adapter (`@prisma/adapter-pg`) |
| **Database** | PostgreSQL 15+ |
| **Runtime** | Bun |
| **Deployment** | Vercel |

### Architecture

```
Presentation Layer  →  Next.js App Router + Tailwind/ShadCN + Framer Motion
Application Layer   →  Route Handlers (src/app/api/*) + Clerk auth checks
Data Layer          →  Prisma ORM + PostgreSQL (singleton via src/lib/prisma.ts)
```

## Building and Running

### Prerequisites

- Node.js 20+
- Bun 1.1+
- PostgreSQL 15+
- Clerk application (dev instance)

### Environment Variables

Create `.env.local` with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxx
```

### Commands

```bash
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# Seed demo data
bunx prisma db seed

# Development server
bun run dev

# Production build
bun run build

# Start production build
bun run start

# Lint
bunx next lint

# Typecheck
bunx tsc --noEmit

# Open Prisma Studio (DB GUI)
bunx prisma studio

# Database sanity check (prints record counts)
bun check-db.ts
```

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma          # Database schema & models
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # Prisma migration history
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth layout group
│   │   ├── sign-in/           # Clerk sign-in page
│   │   ├── sign-up/           # Clerk sign-up page
│   │   ├── dashboard/         # Protected role-based dashboards
│   │   ├── verify/[userId]/   # Public QR verification page
│   │   ├── api/               # REST route handlers
│   │   ├── layout.tsx         # Root providers + metadata
│   │   ├── globals.css        # Tailwind v4 tokens/theme
│   │   ├── page.tsx           # Landing page
│   │   └── loading.tsx        # Root loading state
│   ├── components/
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── ui/                # ShadCN UI primitives
│   ├── lib/                   # Prisma singleton, constants, helpers
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── proxy.ts               # Clerk middleware + RBAC route guards
├── docs/plans/                # Active implementation plans
├── .agent/
│   ├── prd.md                 # Feature requirements
│   ├── architecture.md        # System boundaries, RBAC, DB schemas
│   ├── design.md              # UI/UX tokens and specifications
│   └── status.md              # Project completion status
└── public/                    # Static assets (logo, images)
```

## Key Conventions

### Code Style

- **Strict TypeScript** — never use `any`. Use proper types from `src/types/`.
- **React Server Components first** — use client components (`"use client"`) only when needed.
- **Path aliases** — use `@/*` mapping to `./src/*`.
- **React Compiler** enabled in `next.config.ts`.

### Database

- **Always** import Prisma from `src/lib/prisma.ts` (singleton pattern). Never instantiate `new PrismaClient()` directly.
- Uses `@prisma/adapter-pg` with a connection pool for serverless compatibility.
- Singleton is cached on `globalThis.prismaGlobal` to prevent connection exhaustion during hot-reload.

### Authentication & RBAC

- Clerk manages identity/sessions. Routes are gated in `src/proxy.ts`.
- Role is resolved from Clerk session metadata (`metadata.role` or `public_metadata.role`).
- Role values are lowercase: `student`, `faculty`, `admin`.
- **Public routes** (excluded from auth): `/verify/*`, `/api/verify/*`, `/api/webhooks/*`
- Faculty and students are restricted to their allowed dashboard routes; admins have full access.

### UI

- **ShadCN UI** (New York style, zinc base color, CSS variables).
- **Tailwind CSS v4** — CSS-first configuration in `src/app/globals.css`.
- **Framer Motion** for animations.
- **Lucide React** for icons.
- **Recharts** for charts (via ShadCN chart patterns). *Do not use Chart.js directly.*

## Domain Model

### Core Prisma Models

| Model | Key Fields | Notes |
|-------|-----------|-------|
| **User** | `id`, `clerkId` (unique), `email` (unique), `role` | Base identity; links to role-specific models |
| **Student** | `id`, `userId` (unique), `rollNo` (unique), `department`, `semester` | Has attendances, enrollments, fees, grades, quiz attempts |
| **Faculty** | `id`, `userId` (unique), `department`, `specialization` | Teaches courses |
| **Admin** | `id`, `userId` (unique) | Minimal profile model |
| **Course** | `id`, `courseCode` (unique), `creditHours`, `department`, `semester` | Has attendances, enrollments, grades, quizzes, timetables |
| **Enrollment** | `studentId`, `courseId`, `semester` | Unique constraint on `[studentId, courseId]` |
| **Attendance** | `studentId`, `courseId`, `date`, `status`, `markedBy` | Unique constraint on `[studentId, courseId, date]` |
| **Grade** | `studentId`, `courseId`, `quizMarks`, `assignmentMarks`, `midMarks`, `finalMarks`, `total`, `gpa`, `locked` | Lock prevents further edits |
| **Fee** | `studentId`, `type`, `amount`, `status`, `dueDate`, `paidDate` | Status: Paid/Unpaid/Overdue |
| **Quiz** | `title`, `courseId`, `createdBy`, `duration`, `totalMarks`, `status`, `dueDate` | Has questions and attempts |
| **Question** | `text`, `options` (string[]), `correctOption` (int) | Belongs to a quiz |
| **QuizAttempt** | `quizId`, `studentId`, `score`, `totalMarks`, `answers` (int[]) | Tracks student submissions |
| **Timetable** | `courseId`, `room`, `day`, `startTime`, `endTime` | Conflict prevention enforced |
| **Admission** | `studentName`, `email`, `phone`, `appliedDepartment`, `status`, `cnic`, `marksObtained` | Application tracking |
| **Feedback** | `studentId`, `type` (Faculty/Course), `targetId`, `rating`, `comment` | Anonymization policy TBD |
| **Announcement** | `title`, `content`, `author`, `audience`, `priority` | Targeted by role |

### Enums

- `Role`: STUDENT, FACULTY, ADMIN
- `AttendanceStatus`: Present, Absent, Late
- `FeeStatus`: Paid, Unpaid, Overdue
- `AnnouncementAudience`: Students, Faculty, All
- `Priority`: High, Medium, Low
- `FeedbackType`: Faculty, Course

## API Surface

All route handlers live under `src/app/api/`:

| Route Group | Purpose |
|-------------|---------|
| `/api/admissions` | Admission applications (create, list) |
| `/api/announcements` | System announcements |
| `/api/attendance` | Attendance marking and retrieval |
| `/api/courses` | Course management |
| `/api/dashboard/{admin\|faculty\|student}` | Role-specific dashboard data |
| `/api/faculty` | Faculty directory/info |
| `/api/feedback` | Student feedback submission |
| `/api/fees` | Fee management and dues |
| `/api/grades` | Grade management with lock support |
| `/api/me` | Current user profile |
| `/api/questions` | Quiz question CRUD |
| `/api/quizzes` | Quiz management |
| `/api/students` | Student directory/info |
| `/api/timetable` | Timetable management with conflict detection |
| `/api/verify/[userId]` | Public QR verification (JSON) |
| `/api/webhooks/clerk` | Clerk user sync webhook |

## Business Rules

### Attendance
- Cannot be marked for future dates.
- Auto-calculate percentage: `(Present / Total) * 100`.

### Timetable
- **Rule A:** A teacher cannot be assigned to two classes at the same time slot.
- **Rule B:** A room cannot be booked for two classes at the same time slot.
- Returns `409 Conflict` on overlap.

### Grades
- Locked grades cannot be modified by faculty.
- Audit logging is planned backlog.

### QR Verification (Public)
- `GET /verify/[userId]` — Server Component rendering branded profile card.
- `GET /api/verify/[userId]` — JSON endpoint for external consumers.
- **Safe fields:** Name, Role, Department, Roll No, Semester, Enrollment Date, Dues Status, Specialization, Join Date, Current Lecture, Institution Name.
- **Never exposed:** Email, phone, CNIC, grade details, attendance percentages, financial amounts.

### Clerk Webhook
- Syncs `user.created`, `user.updated`, `user.deleted` to Postgres `User` table.
- Requires `CLERK_WEBHOOK_SIGNING_SECRET` for signature verification.

## Clerk Setup

1. Enable sign-in/sign-up for desired providers.
2. Configure webhook endpoint: `https://<domain>/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Add role to user's public metadata (lowercase): `student`, `faculty`, `admin`

## Deployment (Vercel)

1. Connect repository to Vercel.
2. Add environment variables: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`.
3. Ensure PostgreSQL allows Vercel network access.
4. Run migrations: `bunx prisma migrate deploy`
5. Update Clerk webhook URL to production domain.

## Development Workflow

1. Create a branch for new work.
2. Implement changes following conventions above.
3. Run `bunx tsc --noEmit` and `bunx next lint` — both must pass.
4. Test manually or with existing scripts.
5. Open a PR with scope description and test notes.

## AI Commit Convention

Commits made by AI agents must include:
```
Co-Authored-By: Claude Sonnet 4 <noreply@example.com>
```

## Domain Context Files

Before modifying scope, read these files for authoritative context:

| File | Purpose |
|------|---------|
| `.agent/prd.md` | Feature requirements |
| `.agent/architecture.md` | System boundaries, RBAC, DB schemas |
| `.agent/design.md` | UI/UX tokens and specifications |
| `.agent/status.md` | Project completion status |
| `docs/plans/` | Active implementation plans |
