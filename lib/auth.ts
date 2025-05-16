import { createClient } from "@supabase/supabase-js"
import type { Session, User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import type { Database } from "@/types/supabase"
import { SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY } from "@/lib/env"

export const createServerClient = cache(() => {
  const cookieStore = cookies()

  const supabaseKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !supabaseKey) {
    console.error("Missing Supabase environment variables in server client")
    // Return a minimal client that will fail gracefully
    return createClient<Database>("", "", {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })
  }

  return createClient<Database>(SUPABASE_URL, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
})

export async function getSession(): Promise<Session | null> {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function getUserProfile() {
  const session = await getSession()
  if (!session) return null

  const supabase = createServerClient()

  // First try to get staff profile
  const { data: staffData, error: staffError } = await supabase
    .from("staff")
    .select("*")
    .eq("auth_id", session.user.id)
    .single()

  if (staffData) {
    return { ...staffData, userType: "staff" }
  }

  // If not staff, try to get resident profile
  const { data: residentData, error: residentError } = await supabase
    .from("residents")
    .select("*")
    .eq("auth_id", session.user.id)
    .single()

  if (residentData) {
    return { ...residentData, userType: "resident" }
  }

  console.error("Error getting user profile:", staffError || residentError)
  return null
}

export async function getUserRole(): Promise<string | null> {
  const profile = await getUserProfile()
  if (!profile) return null

  if (profile.userType === "staff") {
    return profile.role
  } else {
    return "resident"
  }
}

export async function canAccessResource(resourceType: string, resourceId: string): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) return false

  const supabase = createServerClient()

  if (profile.userType === "staff") {
    // Staff can access all resources in communities they manage
    if (resourceType === "community") {
      const { data } = await supabase
        .from("staff_communities")
        .select()
        .eq("staff_id", profile.id)
        .eq("community_id", resourceId)
        .single()

      return !!data
    }

    if (resourceType === "task") {
      const { data } = await supabase
        .from("tasks")
        .select("community_id, assigned_to, created_by")
        .eq("id", resourceId)
        .single()

      if (!data) return false

      // Staff can access tasks they created or are assigned to
      if (data.assigned_to === profile.id || data.created_by === profile.id) {
        return true
      }

      // Staff can access tasks in communities they manage
      const { data: communityAccess } = await supabase
        .from("staff_communities")
        .select()
        .eq("staff_id", profile.id)
        .eq("community_id", data.community_id)
        .single()

      return !!communityAccess
    }
  } else if (profile.userType === "resident") {
    // Residents can only access their own community
    if (resourceType === "community") {
      return resourceId === profile.community_id
    }

    // Residents can access maintenance requests they created
    if (resourceType === "maintenance_request") {
      const { data } = await supabase
        .from("maintenance_requests")
        .select()
        .eq("id", resourceId)
        .eq("resident_id", profile.id)
        .single()

      return !!data
    }
  }

  return false
}
