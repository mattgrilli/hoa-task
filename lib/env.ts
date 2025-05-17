// Environment variables helper

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_API_KEY || ""

// Email
export const EMAIL_SERVER = process.env.EMAIL_SERVER || ""
export const EMAIL_PORT = process.env.EMAIL_PORT || ""
export const EMAIL_SECURE = process.env.EMAIL_SECURE === "true"
export const EMAIL_USER = process.env.EMAIL_USER || ""
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ""
export const EMAIL_FROM = process.env.EMAIL_FROM || ""

// App
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY
}

// Check if email is configured
export function isEmailConfigured(): boolean {
  return !!EMAIL_SERVER && !!EMAIL_USER && !!EMAIL_PASSWORD && !!EMAIL_FROM
}
