import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isSupabaseConfigured } from "@/lib/env"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if Supabase environment variables are available
  if (!isSupabaseConfigured()) {
    console.error("Missing Supabase environment variables in middleware")
    // Allow the request to continue, but it will likely fail later
    return res
  }

  const supabase = createMiddlewareClient({ req, res })

  // Rest of the middleware function remains unchanged
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If there's no session and the user is trying to access a protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access a login/register page
  if (session && isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  // Check user type and restrict access to certain routes
  if (session) {
    // Get user profile to determine if they are staff or resident
    const { data: staffProfile } = await supabase
      .from("staff")
      .select("id, role")
      .eq("auth_id", session.user.id)
      .single()

    const { data: residentProfile } = await supabase
      .from("residents")
      .select("id")
      .eq("auth_id", session.user.id)
      .single()

    // Staff-only routes
    const staffOnlyRoutes = ["/staff", "/reports", "/communities/manage"]

    // If user is a resident trying to access staff-only routes
    if (residentProfile && !staffProfile && staffOnlyRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
