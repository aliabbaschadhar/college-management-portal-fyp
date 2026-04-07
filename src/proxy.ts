import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isFacultyRoute = createRouteMatcher(['/dashboard/faculty(.*)'])
const isStudentRoute = createRouteMatcher(['/dashboard/student(.*)'])
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAuthRoute(req)) return;

  const authObject = await auth()
  const role = authObject.sessionClaims?.metadata?.role

  // Redirect users trying to access unauthenticated core paths, unless it's the home page
  if (!authObject.userId && req.nextUrl.pathname.startsWith('/dashboard')) {
    return authObject.redirectToSignIn({ returnBackUrl: req.url })
  }

  // RBAC Checks
  if (isAdminRoute(req) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isFacultyRoute(req) && role !== 'faculty') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isStudentRoute(req) && role !== 'student') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
