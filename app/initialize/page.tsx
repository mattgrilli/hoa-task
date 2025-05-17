"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env"

export default function InitializePage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (log: string) => {
    setLogs((prev) => [...prev, log])
  }

  const initializeDatabase = async () => {
    setLoading(true)
    setStatus("idle")
    setMessage("")
    setLogs([])
    addLog("Starting database initialization...")

    try {
      // Initialize Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Check if we have the service role key
      const serviceKeyAvailable = !!process.env.SUPABASE_API_KEY
      addLog(
        serviceKeyAvailable
          ? "Service role key is available"
          : "Warning: Service role key not available. Some operations may fail.",
      )

      // Step 1: Enable UUID extension
      addLog("Enabling UUID extension...")
      try {
        await supabase.rpc("create_extension", { name: "uuid-ossp" })
        addLog("✓ UUID extension enabled or already exists")
      } catch (error: any) {
        addLog(`⚠️ Could not enable UUID extension: ${error.message}`)
        // Continue anyway
      }

      // Step 2: Create communities table
      addLog("Creating communities table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS communities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            address TEXT,
            city TEXT,
            state TEXT,
            zip TEXT,
            units INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Communities table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating communities table: ${error.message}`)
        throw error
      }

      // Step 3: Create staff table
      addLog("Creating staff table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS staff (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL,
            phone TEXT,
            avatar_url TEXT,
            notification_preferences JSONB DEFAULT '{"taskAssignments": true, "taskUpdates": true, "statusChanges": true, "dueDateReminders": true, "communityUpdates": false, "dailyDigest": false}'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Staff table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating staff table: ${error.message}`)
        throw error
      }

      // Step 4: Create staff_communities junction table
      addLog("Creating staff_communities table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS staff_communities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'manager',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(staff_id, community_id)
          );
        `)
        addLog("✓ Staff_communities table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating staff_communities table: ${error.message}`)
        throw error
      }

      // Step 5: Create tasks table
      addLog("Creating tasks table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS tasks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            due_date DATE NOT NULL,
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            assigned_to UUID REFERENCES staff(id) ON DELETE SET NULL,
            created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Tasks table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating tasks table: ${error.message}`)
        throw error
      }

      // Step 6: Create task_updates table
      addLog("Creating task_updates table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS task_updates (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            user_id UUID REFERENCES staff(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            update_type TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Task_updates table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating task_updates table: ${error.message}`)
        throw error
      }

      // Step 7: Create task_attachments table
      addLog("Creating task_attachments table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS task_attachments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            file_size TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES staff(id) ON DELETE SET NULL
          );
        `)
        addLog("✓ Task_attachments table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating task_attachments table: ${error.message}`)
        throw error
      }

      // Step 8: Create residents table
      addLog("Creating residents table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS residents (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            unit_number TEXT,
            avatar_url TEXT,
            notification_preferences JSONB DEFAULT '{"maintenanceUpdates": true, "communityAnnouncements": true, "paymentReminders": true}'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Residents table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating residents table: ${error.message}`)
        throw error
      }

      // Step 9: Create maintenance_requests table
      addLog("Creating maintenance_requests table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS maintenance_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            priority TEXT NOT NULL DEFAULT 'medium',
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
            assigned_to UUID REFERENCES staff(id) ON DELETE SET NULL,
            unit_number TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
          );
        `)
        addLog("✓ Maintenance_requests table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating maintenance_requests table: ${error.message}`)
        throw error
      }

      // Step 10: Create maintenance_updates table
      addLog("Creating maintenance_updates table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS maintenance_updates (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
            user_id UUID,
            user_type TEXT NOT NULL, -- 'staff' or 'resident'
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Maintenance_updates table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating maintenance_updates table: ${error.message}`)
        throw error
      }

      // Step 11: Create announcements table
      addLog("Creating announcements table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS announcements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            published_at TIMESTAMP WITH TIME ZONE,
            expires_at TIMESTAMP WITH TIME ZONE
          );
        `)
        addLog("✓ Announcements table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating announcements table: ${error.message}`)
        throw error
      }

      // Step 12: Create documents table
      addLog("Creating documents table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            file_url TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size TEXT NOT NULL,
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            category TEXT NOT NULL,
            is_public BOOLEAN NOT NULL DEFAULT false,
            uploaded_by UUID REFERENCES staff(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Documents table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating documents table: ${error.message}`)
        throw error
      }

      // Step 13: Create events table
      addLog("Creating events table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            location TEXT,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE NOT NULL,
            community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
            created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Events table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating events table: ${error.message}`)
        throw error
      }

      // Step 14: Create notifications table
      addLog("Creating notifications table...")
      try {
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            user_type TEXT NOT NULL, -- 'staff' or 'resident'
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            reference_id UUID,
            reference_type TEXT,
            is_read BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        addLog("✓ Notifications table created or already exists")
      } catch (error: any) {
        addLog(`⚠️ Error creating notifications table: ${error.message}`)
        throw error
      }

      // Step 15: Enable RLS on all tables
      addLog("Enabling Row Level Security on tables...")
      const tables = [
        "communities",
        "staff",
        "staff_communities",
        "tasks",
        "task_updates",
        "task_attachments",
        "residents",
        "maintenance_requests",
        "maintenance_updates",
        "announcements",
        "documents",
        "events",
        "notifications",
      ]

      for (const table of tables) {
        try {
          await supabase.query(`
            ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
          `)
          addLog(`✓ RLS enabled on ${table}`)
        } catch (error: any) {
          addLog(`⚠️ Error enabling RLS on ${table}: ${error.message}`)
          // Continue with other tables
        }
      }

      // Step 16: Create RLS policies
      addLog("Creating RLS policies...")

      // Public access policies
      try {
        await supabase.query(`
          CREATE POLICY IF NOT EXISTS "Public access to communities"
          ON communities FOR SELECT
          USING (true);
        `)
        addLog("✓ Created public access policy for communities")
      } catch (error: any) {
        addLog(`⚠️ Error creating public access policy for communities: ${error.message}`)
      }

      try {
        await supabase.query(`
          CREATE POLICY IF NOT EXISTS "Public access to tasks"
          ON tasks FOR SELECT
          USING (true);
        `)
        addLog("✓ Created public access policy for tasks")
      } catch (error: any) {
        addLog(`⚠️ Error creating public access policy for tasks: ${error.message}`)
      }

      // Special policy for the first admin
      try {
        await supabase.query(`
          CREATE POLICY IF NOT EXISTS "Allow insert for the first admin"
          ON staff
          FOR INSERT
          WITH CHECK (
            NOT EXISTS (SELECT 1 FROM staff WHERE role = 'Admin')
          );
        `)
        addLog("✓ Created special policy for first admin")
      } catch (error: any) {
        addLog(`⚠️ Error creating special policy for first admin: ${error.message}`)
      }

      setStatus("success")
      setMessage("Database initialized successfully!")
      addLog("✅ Database initialization complete!")
    } catch (error: any) {
      console.error("Database initialization error:", error)
      setStatus("error")
      setMessage(`Error: ${error.message || "Unknown error"}`)
      addLog(`❌ Database initialization failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Database Initialization</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Initialize Database
          </CardTitle>
          <CardDescription>
            Create all necessary tables, relationships, and security policies for the HOA Task Manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This will create all database tables needed for the application. It's safe to run multiple times as it
              uses IF NOT EXISTS.
            </AlertDescription>
          </Alert>

          {status === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={initializeDatabase} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Database"
            )}
          </Button>
        </CardFooter>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Initialization Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
              {logs.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
          {status === "success" && (
            <CardFooter className="flex justify-center">
              <Button asChild className="mt-4">
                <a href="/setup-admin">
                  Continue to Admin Setup <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}
