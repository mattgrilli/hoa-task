"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getCommunities() {
  const { data, error } = await supabase.from("communities").select("*").order("name")

  if (error) {
    console.error("Error fetching communities:", error)
    return []
  }

  return data
}

export async function getCommunityById(id: string) {
  const { data, error } = await supabase.from("communities").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching community ${id}:`, error)
    return null
  }

  return data
}

export async function createCommunity(name: string, units: number) {
  const { data, error } = await supabase.from("communities").insert([{ name, units }]).select()

  if (error) {
    console.error("Error creating community:", error)
    return null
  }

  revalidatePath("/communities")
  return data[0]
}

export async function updateCommunity(id: string, name: string, units: number) {
  const { data, error } = await supabase.from("communities").update({ name, units }).eq("id", id).select()

  if (error) {
    console.error(`Error updating community ${id}:`, error)
    return null
  }

  revalidatePath("/communities")
  revalidatePath(`/communities/${id}`)
  return data[0]
}

export async function deleteCommunity(id: string) {
  const { error } = await supabase.from("communities").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting community ${id}:`, error)
    return false
  }

  revalidatePath("/communities")
  return true
}
