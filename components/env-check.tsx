"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isSupabaseConfigured } from "@/lib/env"
import { AlertCircle } from "lucide-react"

export function EnvironmentCheck() {
  // Only run this check on the client side
  if (typeof window !== "undefined") {
    const isConfigured = isSupabaseConfigured()

    if (!isConfigured) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Supabase environment variables are missing. Make sure you have set up:
            <ul className="list-disc pl-5 mt-2">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_API_KEY</li>
            </ul>
            <p className="mt-2">Check your .env.local file or environment variables in your deployment platform.</p>
          </AlertDescription>
        </Alert>
      )
    }
  }

  // If everything is configured correctly, don't render anything
  return null
}
