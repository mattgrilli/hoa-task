import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// List of public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth/callback",
  "/test-connection",
  "/api/test-supabase",
  "/api/check-env",
  "/setup",
  "/api/setup-db",
  "/api/seed-db",
  "/setup-admin",
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  if (isPublicRoute) {
    return res
  }

  // Check auth session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and not a public route, redirect to login
  if (!session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
