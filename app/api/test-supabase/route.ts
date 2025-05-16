import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/env"

export async function GET() {
  try {
    // Check if environment variables are configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Supabase environment variables are missing or invalid",
          envStatus: {
            NEXT_PUBLIC_SUPABASE_URL: !!SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
          },
        },
        { status: 500 },
      )
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Test connection by making a simple query
    const { data, error } = await supabase.from("communities").select("count").limit(1)

    if (error) {
      throw error
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      envStatus: {
        NEXT_PUBLIC_SUPABASE_URL: !!SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
      },
    })
  } catch (error: any) {
    console.error("Supabase connection error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unknown error occurred",
        envStatus: {
          NEXT_PUBLIC_SUPABASE_URL: !!SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
        },
      },
      { status: 500 },
    )
  }
}
