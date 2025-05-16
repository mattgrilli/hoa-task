"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/env"

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"success" | "error" | "pending">("pending")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{
    NEXT_PUBLIC_SUPABASE_URL: string | null
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string | null
  }>({
    NEXT_PUBLIC_SUPABASE_URL: null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: null,
  })

  const testConnection = async () => {
    setLoading(true)
    setConnectionStatus("pending")
    setErrorMessage(null)

    try {
      // Check if environment variables are configured
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase environment variables are missing or invalid")
      }

      // Mask the API key for security
      const maskedKey = SUPABASE_ANON_KEY
        ? `${SUPABASE_ANON_KEY.substring(0, 3)}...${SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 3)}`
        : null

      setEnvVars({
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: maskedKey,
      })

      // Create Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Test connection by making a simple query
      const { data, error } = await supabase.from("communities").select("count").limit(1)

      if (error) {
        throw error
      }

      // If we get here, the connection was successful
      setConnectionStatus("success")
    } catch (error: any) {
      console.error("Supabase connection error:", error)
      setConnectionStatus("error")
      setErrorMessage(error.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            This page tests the connection to your Supabase database using the configured environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Environment Variables</h3>
              <div className="rounded-md bg-muted p-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL:</span>
                  <span className="font-mono">{envVars.NEXT_PUBLIC_SUPABASE_URL || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <span className="font-mono">{envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || "Not set"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Connection Status</h3>
              {loading ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Testing connection...</span>
                </div>
              ) : connectionStatus === "success" ? (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-600 dark:text-green-400">Connected</AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Successfully connected to Supabase!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Connection Failed</AlertTitle>
                  <AlertDescription>
                    {errorMessage || "Could not connect to Supabase. Check your environment variables."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Connection Again
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
