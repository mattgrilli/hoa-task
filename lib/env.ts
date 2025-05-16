// Environment variable configuration

// Supabase configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_API_KEY || ""

// Email configuration
export const EMAIL_SERVER = process.env.EMAIL_SERVER || ""
export const EMAIL_PORT = process.env.EMAIL_PORT ? Number.parseInt(process.env.EMAIL_PORT) : 587
export const EMAIL_SECURE = process.env.EMAIL_SECURE === "true"
export const EMAIL_USER = process.env.EMAIL_USER || ""
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ""
export const EMAIL_FROM = process.env.EMAIL_FROM || ""

// Application configuration
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Validation function to check if required environment variables are set
export function validateEnv() {
  const requiredVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: SUPABASE_URL },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: SUPABASE_ANON_KEY },
  ]

  const missingVars = requiredVars.filter((v) => !v.value)

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.map((v) => v.name).join(", ")}`)
    return false
  }

  return true
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!(SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY)
}
