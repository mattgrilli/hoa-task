"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationSettings } from "@/components/notification-settings"
import { ClipboardList } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()

  // Check if we're on an auth page (login, register, etc.)
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <SidebarTrigger className="mr-2 md:hidden" />
        <Link href="/" className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">HOA Task Manager</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {!isAuthPage && (
            <nav className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild className={pathname === "/tasks" ? "bg-accent" : ""}>
                <Link href="/tasks">Tasks</Link>
              </Button>
              <Button variant="ghost" asChild className={pathname === "/communities" ? "bg-accent" : ""}>
                <Link href="/communities">Communities</Link>
              </Button>
              <Button variant="ghost" asChild className={pathname === "/staff" ? "bg-accent" : ""}>
                <Link href="/staff">Staff</Link>
              </Button>
              <Button variant="ghost" asChild className={pathname === "/reports" ? "bg-accent" : ""}>
                <Link href="/reports">Reports</Link>
              </Button>
              <Button variant="ghost" asChild className={pathname === "/test-connection" ? "bg-accent" : ""}>
                <Link href="/test-connection">Test Connection</Link>
              </Button>
            </nav>
          )}
          {!isAuthPage && (
            <>
              <NotificationSettings />
              <ModeToggle />
              <UserNav />
            </>
          )}
          {isAuthPage && (
            <div className="flex items-center space-x-2">
              <ModeToggle />
              {pathname !== "/login" && (
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
              {pathname !== "/register" && (
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
