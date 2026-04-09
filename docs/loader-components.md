# Custom Loader Components

This document describes the custom loader components available in the college management portal.

## Overview

We have created a comprehensive loader system using **Framer Motion** for animations and **Tailwind CSS v4** for styling, following our design system with brand colors (`#3D5EE1` primary, `#6FCCD8` secondary).

## Components

### 1. Spinner

A branded, animated Topi-based spinner component (API-compatible with previous spinner usage).

```tsx
import { Spinner } from "@/components/ui"

// Basic usage
<Spinner />

// Custom size
<Spinner size="sm" />   // 16x16
<Spinner size="md" />   // 32x32 (default)
<Spinner size="lg" />   // 48x48
<Spinner size="xl" />   // 64x64

// Custom color
<Spinner variant="primary" />   // Brand primary (default)
<Spinner variant="secondary" /> // Brand secondary
<Spinner variant="white" />     // White

// With additional classes
<Spinner className="mt-4" />
```

### 2. TopiLoader

Direct access to the Topi SVG loader with progressive reveal animation.

```tsx
import { TopiLoader } from "@/components/ui"

// Basic usage
<TopiLoader />

// Sizes
<TopiLoader size="sm" />
<TopiLoader size="md" />
<TopiLoader size="lg" />
<TopiLoader size="xl" />

// Variants
<TopiLoader variant="primary" />
<TopiLoader variant="secondary" />
<TopiLoader variant="white" />
```

### 3. Loader

A versatile loader with multiple animation variants.

```tsx
import { Loader } from "@/components/ui"

// Spinner variant (default)
<Loader />
<Loader variant="primary" />
<Loader variant="secondary" />

// Dots animation
<Loader variant="dots" />
<Loader variant="dots" size="lg" label="Loading data..." />

// Bars animation
<Loader variant="bars" />
<Loader variant="bars" size="xl" label="Processing..." />

// With label
<Loader label="Fetching records..." />

// Sizes: sm, md, lg, xl
<Loader size="sm" />
<Loader size="lg" />
```

### 4. FullPageLoader

A full-screen loader with backdrop blur, perfect for route transitions or major loading states.

```tsx
import { FullPageLoader } from "@/components/ui"

// Basic usage
<FullPageLoader />

// With custom label
<FullPageLoader label="Loading dashboard..." />

// As overlay (fixed position with backdrop)
<FullPageLoader overlay label="Saving changes..." />

// Conditional rendering
{isLoading && <FullPageLoader label="Loading..." />}

// Custom size and variant
<FullPageLoader 
  size="xl" 
  variant="secondary"
  label="Preparing your data..." 
/>
```

### 5. Skeleton

Basic skeleton loading component for content placeholders.

```tsx
import { Skeleton } from "@/components/ui"

// Text skeletons
<Skeleton variant="text" />
<Skeleton variant="text-sm" />
<Skeleton variant="heading" />

// Multiple lines
<Skeleton variant="text" lines={3} />

// Shapes
<Skeleton variant="circle" />
<Skeleton variant="rectangle" />
<Skeleton variant="card" />
<Skeleton variant="avatar" />
<Skeleton variant="button" />
<Skeleton variant="image" />

// Custom sizing
<Skeleton variant="text" className="w-48" />
<Skeleton variant="circle" className="h-16 w-16" />
```

### 6. Pre-built Skeleton Loaders

Ready-to-use skeleton components for common dashboard patterns.

```tsx
import { CardSkeleton, TableSkeleton, ProfileSkeleton } from "@/components/ui"

// Card placeholder
<CardSkeleton />

// Table with rows (default 5 rows)
<TableSkeleton />
<TableSkeleton rows={10} />

// Profile section
<ProfileSkeleton />
```

## Usage Patterns

### Pattern 1: Dashboard Loading

```tsx
import { FullPageLoader } from "@/components/ui"

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData()
  
  if (isLoading) {
    return <FullPageLoader label="Loading dashboard..." />
  }
  
  return <DashboardContent data={data} />
}
```

### Pattern 2: Card Content Loading

```tsx
import { CardSkeleton } from "@/components/ui"

export default function StatsSection() {
  const { data, isLoading } = useStatsData()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        : data.map((stat) => <StatCard key={stat.id} {...stat} />)
      }
    </div>
  )
}
```

### Pattern 3: Button Loading State

```tsx
import { Spinner } from "@/components/ui"
import { Button } from "@/components/ui/button"

export function SaveButton({ loading }: { loading: boolean }) {
  return (
    <Button disabled={loading}>
      {loading && <Spinner size="sm" variant="white" />}
      {loading ? "Saving..." : "Save Changes"}
    </Button>
  )
}
```

### Pattern 4: Table Loading

```tsx
import { TableSkeleton } from "@/components/ui"

export default function StudentsTable() {
  const { data, isLoading } = useStudentsData()
  
  return (
    <div>
      {isLoading
        ? <TableSkeleton rows={8} />
        : <DataTable data={data} />
      }
    </div>
  )
}
```

## Design System Compliance

All loader components follow our design system:

- **Colors**: Use brand tokens (`--color-brand-primary`, `--color-brand-secondary`)
- **Animations**: Framer Motion with smooth transitions
- **Border Radius**: Consistent with Tailwind `rounded-md`, `rounded-lg`, `rounded-xl`
- **Dark Mode**: Fully supported with automatic theme switching
- **Accessibility**: Proper ARIA labels and semantic HTML

## Technical Details

- **Framework**: React Server Components compatible (all loaders are client components)
- **Animation Library**: Framer Motion (already in dependencies)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Type Safety**: Full TypeScript support with proper interfaces

## File Structure

```
src/components/ui/
├── spinner.tsx              # Basic circular spinner
├── topi-loader.tsx          # Branded topi SVG loader
├── loader.tsx               # Multi-variant loader
├── full-page-loader.tsx     # Full-screen overlay loader
├── skeleton.tsx             # Basic skeleton component
├── skeleton-loaders.tsx     # Pre-built skeleton patterns
└── index.ts                 # Centralized exports
```

## Best Practices

1. **Use FullPageLoader** for initial page loads or route transitions
2. **Use Skeleton components** for content placeholders during data fetching
3. **Use Spinner** for button loading states or small inline loaders
4. **Use Loader** with variants for branded loading sections
5. **Always provide labels** for accessibility and user context
6. **Match size to context**: sm for inline, md for sections, lg/xl for full-page
