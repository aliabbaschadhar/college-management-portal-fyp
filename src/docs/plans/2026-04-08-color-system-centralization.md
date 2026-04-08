# Color System Centralization Plan

**Goal:** Ensure all project colors are sourced from a single centralized token system, and eliminate ad-hoc hardcoded color literals in app code.

**Current Finding:** There is partial centralization, but not full central import usage.
- Token source exists in `src/app/globals.css` (`--color-brand-*`, `--color-system-*`).
- Additional palette exists in `src/lib/colors.ts`.
- Many pages/components still use hardcoded hex/rgb values directly.

**Architecture:** Use CSS custom properties in `src/app/globals.css` as the single source of truth for color tokens. Add semantic and chart tokens there, then consume only token-backed Tailwind utilities or `var(--token)` values in components. Keep `src/lib/colors.ts` only if needed for non-CSS runtime scenarios; otherwise deprecate it.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, ShadCN UI, Recharts.

---

### Task 1: Define Single Source Token Contract

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/lib/colors.ts` (align or deprecate)

**Step 1: Expand token set in globals.css**
Add complete token groups that cover current usage:
- Brand tokens: primary/secondary/neutral
- Semantic tokens: success/warning/danger/info
- Data viz tokens: chart-1..chart-N (aligned with dashboard charts)
- Surface/text/border tokens for cards and states

**Step 2: Decide role of lib/colors.ts**
Pick one approach and document it in file header comments:
- Preferred: Keep CSS tokens as canonical source and remove duplicated hex definitions from `src/lib/colors.ts`.
- Alternate: Generate/export values that mirror CSS tokens and keep strict one-way mapping.

**Step 3: Verify no token name collisions**
Run: `bunx tsc --noEmit`
Expected: PASS

---

### Task 2: Replace Hardcoded Colors in Priority Surfaces

**Files (first pass):**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/sign-in/[[...sign-in]]/page.tsx`
- Modify: `src/app/sign-up/[[...sign-up]]/page.tsx`
- Modify: `src/components/dashboard/AdminDashboardHome.tsx`
- Modify: `src/components/dashboard/FacultyDashboardHome.tsx`
- Modify: `src/components/dashboard/StudentDashboardHome.tsx`

**Step 1: Replace hex/rgb literals with tokens**
- Convert literals like `#3D5EE1`, `#1ABE17`, `rgba(...)` to semantic tokens.
- For Clerk appearance, map from centralized token constants (or keep one mapping object fed by same token definitions).

**Step 2: Normalize chart colors**
- Replace repeated chart arrays with shared chart token map.
- Ensure chart legends and slices use token-consistent colors.

**Step 3: Verify lint/typecheck**
Run:
- `bunx tsc --noEmit`
- `bunx next lint`
Expected: PASS

---

### Task 3: Complete Sweep for Remaining Literals

**Files:**
- Modify all remaining files returned by color literal search in `src/**`.

**Step 1: Run detection search**
Use regex checks for remaining literal colors:
- `#[0-9a-fA-F]{3,8}`
- `rgb(` / `rgba(`
- `hsl(` / `hsla(`

**Step 2: Migrate only app-owned color literals**
- Keep third-party styling internals as-is when required (for example, library selector internals in ShadCN chart utility strings).
- Replace app-authored literals with centralized tokens.

**Step 3: Verify functional parity**
Run:
- `bun run dev` and validate key screens:
  - Landing page
  - Auth pages
  - Dashboard home variants (admin/faculty/student)
  - Feedback/attendance/dues pages
Expected: Visual behavior unchanged except improved consistency.

---

### Task 4: Add Guardrails to Prevent Regression

**Files:**
- Create: `docs/color-system.md` or `src/docs/color-system.md`
- Optionally modify lint config if adding custom checks.

**Step 1: Document token usage rules**
Document:
- Which file is canonical token source
- Allowed ways to apply color in components
- Exceptions policy for third-party internals

**Step 2: Add enforcement checks (optional but recommended)**
- Add a CI check (script or lint rule) to flag newly introduced hardcoded color literals in app code.

**Step 3: Final verification**
Run:
- `bunx tsc --noEmit`
- `bunx next lint`
- `bun run build`
Expected: PASS

---

## Success Criteria
- One canonical color token source is documented and used.
- No project-authored hardcoded color literals remain in `src/**` (except approved third-party internals).
- Dashboard and auth flows retain current visual intent with improved consistency.
- New color additions follow token-first workflow.
