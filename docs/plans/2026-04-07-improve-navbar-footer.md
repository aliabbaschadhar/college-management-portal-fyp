# Premium Navbar & Footer Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing Navbar and Footer into a high-end, premium "dark glassmorphism" interface with smooth animations and rich textures.

**Architecture:** 
- Modularize the Footer into `src/components/Footer.tsx`.
- Enhance the `Header.tsx` with `framer-motion` for all transitions.
- Use a unified "Glow & Glass" design system across both components.
- Integrate `magic-ui` inspiration for background patterns and interactive elements.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React, Clerk (Auth).

---

### Task 1: Initialize Footer Component

**Files:**
- Create: `src/components/Footer.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create the Footer component with rich layout**
Implement a multi-column footer with:
- Brand section with logo and description.
- Links sections (College, Academic, Resources, Help).
- Social icons with hover effects.
- Bottom bar with copyright and legal links.
- Glassmorphic style with subtle top border.

**Step 2: Extract from page.tsx**
Remove the inline footer from `src/app/page.tsx` and import/use the new `<Footer />` component.

**Step 3: Commit**
`git add src/components/Footer.tsx src/app/page.tsx && git commit -m "feat: extract and upgrade footer to premium component"`

---

### Task 2: Enhance Navbar (Header) with Glassmorphism & Framer Motion

**Files:**
- Modify: `src/components/Header.tsx`

**Step 1: Implement Scroll-Progress Indicator**
Add a thin gradient line at the top of the header that grows as the user scrolls.

**Step 2: Upgrade Glassmorphism & Animations**
- Use `framer-motion` for the header visibility and background transitions.
- Enhance the `backdrop-blur` and `background` opacity logic based on scroll state.
- Add "Design Spells": subtle hover transition for links with a bottom-bar "underline" effect.

**Step 3: Revamp Mobile Menu**
- Use `AnimatePresence` and `motion.div` for a smooth slide-down/fade-in mobile menu.
- Add staggered animations for individual mobile menu links.

**Step 4: Commit**
`git add src/components/Header.tsx && git commit -m "feat: enhance navbar with glassmorphism and framer-motion animations"`

---

### Task 3: Add Premium Micro-interactions (Design Spells)

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/Header.tsx`

**Step 1: Add Link Hover "Spells"**
Implement a magnetic effect or a glow-on-hover for primary navigation items and footer links.

**Step 2: Add Background Textures**
Integrate a subtle dot pattern or retro grid (inspired by `magic-ui`) to the footer background to give it more depth.

**Step 3: Final Polishing**
- Ensure color consistency with the brand palette (#3D5EE1, #6FCCD8).
- Verify mobile responsiveness and Clerk auth state integration.

**Step 4: Commit**
`git add . && git commit -m "style: final polish and premium micro-interactions for navbar/footer"`
