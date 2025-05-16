import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/env"

// Create the Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Export the configuration check function
export { isSupabaseConfigured }
