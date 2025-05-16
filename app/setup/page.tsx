"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Database, Info, Loader2, XCircle } from "lucide-react"

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [setupMessage, setSetupMessage] = useState("")
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [seedMessage, setSeedMessage] = useState("")

  const setupDatabase = async () => {
    setSetupStatus("loading")
    setSetupMessage("Setting up database schema...")

    try {
      const response = await fetch("/api/setup-db")
      const data = await response.json()

      if (data.error) {
        setSetupStatus("error")
        setSetupMessage(`Error: ${data.error}`)
        console.error("Setup error:", data)
      } else {
        setSetupStatus("success")
        setSetupMessage("Database schema setup successfully!")
      }
    } catch (error) {
      setSetupStatus("error")
      setSetupMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Setup error:", error)
    }
  }

  const seedDatabase = async () => {
    setSeedStatus("loading")
    setSeedMessage("Seeding database with initial data...")

    try {
      const response = await fetch("/api/seed-db")
      const data = await response.json()

      if (data.error) {
        setSeedStatus("error")
        setSeedMessage(`Error: ${data.error}`)
        console.error("Seed error:", data)
      } else {
        setSeedStatus("success")
        setSeedMessage("Database seeded successfully!")
      }
    } catch (error) {
      setSeedStatus("error")
      setSeedMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Seed error:", error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Setup</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 1: Setup Database Schema
            </CardTitle>
            <CardDescription>
              Create all necessary tables, relationships, and security policies for the HOA Task Manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {setupStatus === "success" && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">{setupMessage}</AlertDescription>
              </Alert>
            )}

            {setupStatus === "error" && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{setupMessage}</AlertDescription>
              </Alert>
            )}

            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This will create all the necessary database tables and relationships. It's safe to run multiple times as
                it uses IF NOT EXISTS.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={setupDatabase} disabled={setupStatus === "loading"} className="w-full">
              {setupStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Setup Database Schema"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 2: Seed Database
            </CardTitle>
            <CardDescription>Populate the database with initial data for testing and development.</CardDescription>
          </CardHeader>
          <CardContent>
            {seedStatus === "success" && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">{seedMessage}</AlertDescription>
              </Alert>
            )}

            {seedStatus === "error" && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{seedMessage}</AlertDescription>
              </Alert>
            )}

            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This will add sample communities, staff, tasks, and other data to your database. Only run this once to
                avoid duplicate data.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={seedDatabase}
              disabled={seedStatus === "loading" || setupStatus !== "success"}
              className="w-full"
            >
              {seedStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                "Seed Database"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {setupStatus === "success" && seedStatus === "success" && (
        <div className="mt-8">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Setup Complete!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your database is now set up and populated with sample data. You can now use the application with real data
              from Supabase.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <a href="/">Go to Dashboard</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
