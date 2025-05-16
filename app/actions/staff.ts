"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getStaff() {
  const { data, error } = await supabase.from("staff").select("*").order("name")

  if (error) {
    console.error("Error fetching staff:", error)
    return []
  }

  return data
}

export async function getStaffWithCommunities() {
  const { data, error } = await supabase
    .from("staff")
    .select(`
      *,
      staff_communities(
        community_id,
        communities:community_id(
          id,
          name
        )
      )
    `)
    .order("name")

  if (error) {
    console.error("Error fetching staff with communities:", error)
    return []
  }

  // Transform the data to match the expected format
  const transformedData = data.map((staff) => {
    const communities = staff.staff_communities.map((sc: any) => ({
      id: sc.communities.id,
      name: sc.communities.name,
    }))

    return {
      ...staff,
      communities,
    }
  })

  return transformedData
}

export async function getStaffById(id: string) {
  const { data, error } = await supabase
    .from("staff")
    .select(`
      *,
      staff_communities(
        community_id,
        communities:community_id(
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching staff ${id}:`, error)
    return null
  }

  // Transform the data to match the expected format
  const communities = data.staff_communities.map((sc: any) => ({
    id: sc.communities.id,
    name: sc.communities.name,
  }))

  return {
    ...data,
    communities,
  }
}

export async function createStaff(name: string, email: string, role: string, avatar_url?: string) {
  const { data, error } = await supabase.from("staff").insert([{ name, email, role, avatar_url }]).select()

  if (error) {
    console.error("Error creating staff:", error)
    return null
  }

  revalidatePath("/staff")
  return data[0]
}

export async function updateStaff(
  id: string,
  updates: { name?: string; email?: string; role?: string; avatar_url?: string },
) {
  const { data, error } = await supabase.from("staff").update(updates).eq("id", id).select()

  if (error) {
    console.error(`Error updating staff ${id}:`, error)
    return null
  }

  revalidatePath("/staff")
  return data[0]
}

export async function assignStaffToCommunity(staffId: string, communityId: string) {
  const { data, error } = await supabase
    .from("staff_communities")
    .insert([{ staff_id: staffId, community_id: communityId }])
    .select()

  if (error) {
    console.error(`Error assigning staff ${staffId} to community ${communityId}:`, error)
    return null
  }

  revalidatePath("/staff")
  revalidatePath("/communities")
  return data[0]
}

export async function removeStaffFromCommunity(staffId: string, communityId: string) {
  const { error } = await supabase
    .from("staff_communities")
    .delete()
    .eq("staff_id", staffId)
    .eq("community_id", communityId)

  if (error) {
    console.error(`Error removing staff ${staffId} from community ${communityId}:`, error)
    return false
  }

  revalidatePath("/staff")
  revalidatePath("/communities")
  return true
}
