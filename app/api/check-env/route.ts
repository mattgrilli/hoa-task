import { NextResponse } from "next/server"

export async function GET() {
  // Check if environment variables are set
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_API_KEY: !!process.env.SUPABASE_API_KEY,
    // Don't return the actual values for security reasons
  }

  // Return the status of environment variables
  return NextResponse.json({
    message: "Environment variable status",
    status: envStatus,
    allConfigured: Object.values(envStatus).every(Boolean),
  })
}
