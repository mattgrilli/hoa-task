"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldCheck, Info } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env"

export default function ManualAdminSetupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Create a Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

      // Display the user ID for manual database entry
      setResult({
        success: true,
        message: `
          Auth user created successfully!
          
          User ID: ${authData.user?.id}
          
          Now you need to manually create a staff record in your database with:
          - auth_id: ${authData.user?.id}
          - name: ${formData.name}
          - email: ${formData.email}
          - role: Admin
          
          SQL Example:
          INSERT INTO public.staff (auth_id, name, email, role)
          VALUES ('${authData.user?.id}', '${formData.name}', '${formData.email}', 'Admin');
        `,
      })

      toast({
        title: "Auth user created",
        description: "User created successfully. See instructions for next steps.",
      })
    } catch (error: any) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      })
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Manual Admin Setup
          </CardTitle>
          <CardDescription>
            Use this page to manually create an admin user when the automatic setup fails.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Advanced Users Only</AlertTitle>
              <AlertDescription>
                This page is for advanced users who need to manually set up an admin account. You will need to manually
                insert a record in the database after creating the auth user.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
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
              />
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription className="whitespace-pre-line">{result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Auth User...
                </>
              ) : (
                "Create Auth User"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
