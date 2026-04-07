# Clerk Auth and Prisma Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Prisma ORM with PostgreSQL and integrate Clerk for authentication, securing the `/dashboard` route.

**Architecture:** We will initialize Prisma with PostgreSQL, define the initial `User` schema based on the PRD, and configure the Prisma client. We will then integrate Clerk into the Next.js app, wrap it in `ClerkProvider`, and use Clerk's middleware to protect dashboard routes.

**Tech Stack:** Next.js, Prisma, PostgreSQL, Clerk

---

### Task 1: Initialize Prisma and Define Core Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Step 1: Install dependencies and init**

Run: `npm install -D prisma` and `npm install @prisma/client` and `npx prisma init`
Expected: Prisma initialized correctly

**Step 2: Define Schema in schema.prisma**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  name      String
  role      String   @default("student") // student, faculty, admin
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Step 3: Create Prisma Client Instance**

Create file `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 4: Verify format**

Run: `npx prisma format`
Expected: PASS

**Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts package.json package-lock.json
git commit -m "chore: setup Prisma ORM and core User schema"
```

### Task 2: Install and Configure Clerk Auth

**Files:**
- Create/Modify: `src/middleware.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Install Clerk Next.js SDK**

Run: `npm install @clerk/nextjs`
Expected: PASS

**Step 2: Add Clerk Provider**

Modify `src/app/layout.tsx` to include the `ClerkProvider` around the root layout structure.

**Step 3: Implement Middleware for Protection**

Create file `src/middleware.ts` (or `src/proxy.ts` depending on the current standard in this codebase, assume standard NextJS `middleware.ts`):
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

**Step 4: Build test to verify types**

Run: `npm run build`
Expected: Build passes without type errors.

**Step 5: Commit**

```bash
git add src/middleware.ts src/app/layout.tsx package.json package-lock.json
git commit -m "feat: integrate Clerk auth and secure dashboard route"
```
