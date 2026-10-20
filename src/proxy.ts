import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/verify(.*)',      // Public QR verification page — no login required
  '/api/verify(.*)', // Public QR verification API  — no login required
])

const FACULTY_ALLOWED_ROUTES = [
  '/dashboard',
  '/dashboard/classes',
  '/dashboard/mark-attendance',
  '/dashboard/grades',
  '/dashboard/question-bank',
  '/dashboard/quizzes',
  '/dashboard/feedback',
  '/dashboard/settings',
  '/dashboard/students',
]

const STUDENT_ALLOWED_ROUTES = [
  '/dashboard',
  '/dashboard/my-courses',
  '/dashboard/my-attendance',
  '/dashboard/my-grades',
  '/dashboard/my-dues',
  '/dashboard/my-timetable',
  '/dashboard/take-quiz',
  '/dashboard/submit-feedback',
  '/dashboard/settings',
]

type Role = 'admin' | 'faculty' | 'student'

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function isAllowedPath(pathname: string, allowedRoutes: string[]): boolean {
  return allowedRoutes.some((route) => matchesRoute(pathname, route))
}

function getRole(claims: unknown): Role {
  const roleValue =
    (claims as { metadata?: { role?: unknown } })?.metadata?.role ??
    (claims as { public_metadata?: { role?: unknown } })?.public_metadata?.role

  if (typeof roleValue !== 'string') {
    return 'student'
  }

  const normalizedRole = roleValue.toLowerCase()

  if (normalizedRole === 'admin' || normalizedRole === 'faculty' || normalizedRole === 'student') {
    return normalizedRole
  }

  return 'student'
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    if (rateLimitMap.size > 1000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";

  // Rate limit sensitive endpoints to defend against brute force and DoS scraping
  if (pathname.startsWith("/api/onboarding")) {
    if (!checkRateLimit(`onboard_${ip}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (pathname.startsWith("/api/verify")) {
    if (!checkRateLimit(`verify_${ip}`, 80, 60_000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (isAuthRoute(req)) return;

  const authObject = await auth()
  const role = getRole(authObject.sessionClaims)

  // Redirect users trying to access unauthenticated core paths, unless it's the home page
  if (!authObject.userId && pathname.startsWith('/dashboard')) {
    return authObject.redirectToSignIn({ returnBackUrl: req.url })
  }

  if (!pathname.startsWith('/dashboard')) {
    return
  }

  if (role === 'admin') {
    return
  }

  if (role === 'faculty' && !isAllowedPath(pathname, FACULTY_ALLOWED_ROUTES)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (role === 'student' && !isAllowedPath(pathname, STUDENT_ALLOWED_ROUTES)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
