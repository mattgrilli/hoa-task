"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ClipboardList, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env"

export default function VerifyEmailPage() {
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_confirmation") {
          setError("Invalid verification link")
          setVerifying(false)
          return
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) throw error

        setSuccess(true)
      } catch (error: any) {
        setError(error.message || "Failed to verify email")
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            {verifying ? (
              <ClipboardList className="h-12 w-12 text-primary" />
            ) : success ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {verifying ? "Verifying Email" : success ? "Email Verified" : "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {verifying
              ? "Please wait while we verify your email address..."
              : success
                ? "Your email has been successfully verified."
                : "We couldn't verify your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!verifying && (
            <Alert
              className={
                success
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
                  : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900"
              }
            >
              <AlertDescription
                className={success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
              >
                {success
                  ? "You can now sign in to your account."
                  : error || "Please try again or contact support if the problem persists."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!verifying && (
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
