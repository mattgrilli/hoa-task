"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldCheck, Info, AlertTriangle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(true)
  const [setupNeeded, setSetupNeeded] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Create a Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    async function checkAdminExists() {
      try {
        setLoading(true)

        // Use a direct count query instead of fetching records
        const { count, error } = await supabase
          .from("staff")
          .select("*", { count: "exact", head: true })
          .eq("role", "Admin")

        if (error) {
          console.error("Error checking admin status:", error)
          setDbError(`Database error: ${error.message}`)
          // Still allow setup if there's an error
          setSetupNeeded(true)
        } else {
          // If count > 0, admin exists
          setSetupNeeded(count === 0)
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error)
        setDbError(`Error: ${error.message}`)
        // Still allow setup if there's an error
        setSetupNeeded(true)
      } finally {
        setLoading(false)
      }
    }

    checkAdminExists()
  }, [supabase])

  // Fix: Use a proper onChange handler that doesn't trigger form submission
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault() // Prevent any default behavior
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Fix: Ensure the form submission is properly handled
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent form submission

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: "Admin",
          },
        },
      })

      if (authError) throw authError

      // 2. Create staff record with admin role
      const { error: staffError } = await supabase.from("staff").insert([
        {
          auth_id: authData.user?.id,
          name: formData.name,
          email: formData.email,
          role: "Admin",
          notification_preferences: {
            taskAssignments: true,
            taskUpdates: true,
            statusChanges: true,
            dueDateReminders: true,
            communityUpdates: true,
            dailyDigest: true,
          },
        },
      ])

      if (staffError) {
        console.error("Error creating staff record:", staffError)
        throw staffError
      }

      // Success!
      toast({
        title: "Admin account created",
        description: "Your admin account has been set up successfully. You can now log in.",
        variant: "default",
      })

      // Redirect to login page
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Error setting up admin:", error)
      toast({
        title: "Error creating admin account",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!setupNeeded) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Admin Already Exists</AlertTitle>
          <AlertDescription>
            An admin account has already been set up. Please log in with your admin credentials.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Create Admin Account
          </CardTitle>
          <CardDescription>Set up the initial administrator account for your HOA Task Manager.</CardDescription>
        </CardHeader>
        {/* Fix: Ensure the form doesn't submit on input changes */}
        <form onSubmit={handleSubmit} method="POST">
          <CardContent className="space-y-4">
            {dbError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Database Notice</AlertTitle>
                <AlertDescription>{dbError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This admin account will have full access to all features and data in the system. Keep your credentials
                secure.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
