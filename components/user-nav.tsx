"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Bell } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/env"

export function UserNav() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      if (!isSupabaseConfigured()) {
        console.error("Missing Supabase environment variables in user-nav component")
        setLoading(false)
        return
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      // Try to get staff profile first
      const { data: staffData } = await supabase
        .from("staff")
        .select("*, staff_communities(community_id, communities:community_id(name))")
        .eq("auth_id", session.user.id)
        .single()

      if (staffData) {
        // Get unread notifications count
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", staffData.id)
          .eq("user_type", "staff")
          .eq("is_read", false)

        setUnreadNotifications(count || 0)
        setUser({ ...staffData, userType: "staff" })
        setLoading(false)
        return
      }

      // If not staff, try to get resident profile
      const { data: residentData } = await supabase
        .from("residents")
        .select("*, communities:community_id(name)")
        .eq("auth_id", session.user.id)
        .single()

      if (residentData) {
        // Get unread notifications count
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", residentData.id)
          .eq("user_type", "resident")
          .eq("is_read", false)

        setUnreadNotifications(count || 0)
        setUser({ ...residentData, userType: "resident" })
      } else {
        // User exists in auth but not in staff or residents
        // This could be a new user that needs to complete profile setup
        setUser({
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email,
          userType: "incomplete",
        })
      }

      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) {
      console.error("Missing Supabase environment variables in user-nav component")
      return
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {unreadNotifications > 0 && (
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadNotifications}
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || "/abstract-geometric-shapes.png"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              {user.userType === "staff" && <p className="text-xs text-muted-foreground">{user.role}</p>}
              {user.userType === "resident" && (
                <p className="text-xs text-muted-foreground">
                  {user.communities?.name} - Unit {user.unit_number}
                </p>
              )}
              {user.userType === "incomplete" && <p className="text-xs text-amber-500">Complete your profile</p>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                {unreadNotifications > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {unreadNotifications}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
