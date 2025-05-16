import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { getCurrentUser } from "@/lib/auth"

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">HOA Task Manager</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/tasks" className="transition-colors hover:text-foreground/80">
              Tasks
            </Link>
            <Link href="/communities" className="transition-colors hover:text-foreground/80">
              Communities
            </Link>
            <Link href="/staff" className="transition-colors hover:text-foreground/80">
              Staff
            </Link>
            <Link href="/reports" className="transition-colors hover:text-foreground/80">
              Reports
            </Link>
            <Link href="/test-connection" className="transition-colors hover:text-foreground/80">
              Test Connection
            </Link>
            <Link href="/setup" className="transition-colors hover:text-foreground/80">
              Setup Database
            </Link>
            <Link href="/setup-admin" className="transition-colors hover:text-foreground/80">
              Setup Admin
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="outline" asChild className="inline-flex items-center whitespace-nowrap md:hidden">
              <Link href="/">HOA Task Manager</Link>
            </Button>
          </div>
          <ModeToggle />
          {user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
