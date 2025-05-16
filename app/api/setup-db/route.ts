import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_API_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("Setting up database schema...")

    try {
      // Enable necessary extensions
      console.log("Enabling UUID extension...")
      await supabase.rpc("create_extension", { name: "uuid-ossp" })

      // Create communities table
      console.log("Creating communities table...")
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
      console.log("Communities table created or already exists")

      // Create staff table (linked to auth.users)
      console.log("Creating staff table...")
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
      console.log("Staff table created or already exists")

      // Create staff_communities junction table
      console.log("Creating staff_communities table...")
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
      console.log("Staff_communities table created or already exists")

      // Create tasks table
      console.log("Creating tasks table...")
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
      console.log("Tasks table created or already exists")

      // Create task_updates table
      console.log("Creating task_updates table...")
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
      console.log("Task_updates table created or already exists")

      // Create task_attachments table
      console.log("Creating task_attachments table...")
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
      console.log("Task_attachments table created or already exists")

      // Create residents table
      console.log("Creating residents table...")
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
      console.log("Residents table created or already exists")

      // Create maintenance_requests table
      console.log("Creating maintenance_requests table...")
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
      console.log("Maintenance_requests table created or already exists")

      // Create maintenance_updates table
      console.log("Creating maintenance_updates table...")
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
      console.log("Maintenance_updates table created or already exists")

      // Create announcements table
      console.log("Creating announcements table...")
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
      console.log("Announcements table created or already exists")

      // Create documents table
      console.log("Creating documents table...")
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
      console.log("Documents table created or already exists")

      // Create events table
      console.log("Creating events table...")
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
      console.log("Events table created or already exists")

      // Create notifications table
      console.log("Creating notifications table...")
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
      console.log("Notifications table created or already exists")

      // Enable RLS on all tables
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
        console.log(`Enabling RLS on ${table}...`)
        await supabase.query(`
          ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
        `)
      }

      // Create policies for staff
      // Staff can read all communities
      console.log("Creating RLS policies for staff...")
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Staff can read all communities"
        ON communities FOR SELECT
        USING (
          auth.uid() IN (
            SELECT auth_id FROM staff
          )
        );
      `)

      // Staff can read all tasks
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Staff can read all tasks"
        ON tasks FOR SELECT
        USING (
          auth.uid() IN (
            SELECT auth_id FROM staff
          )
        );
      `)

      // Staff can update tasks they are assigned to or created
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Staff can update their tasks"
        ON tasks FOR UPDATE
        USING (
          auth.uid() IN (
            SELECT auth_id FROM staff WHERE id = tasks.assigned_to OR id = tasks.created_by
          )
        );
      `)

      // Staff can read their own notifications
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Staff can read their own notifications"
        ON notifications FOR SELECT
        USING (
          auth.uid() IN (
            SELECT auth_id FROM staff WHERE id::text = notifications.user_id::text
          ) AND notifications.user_type = 'staff'
        );
      `)

      // Create policies for residents
      // Residents can read their own community
      console.log("Creating RLS policies for residents...")
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Residents can read their own community"
        ON communities FOR SELECT
        USING (
          auth.uid() IN (
            SELECT auth_id FROM residents WHERE community_id = communities.id
          )
        );
      `)

      // Residents can read and create maintenance requests for their unit
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Residents can read their maintenance requests"
        ON maintenance_requests FOR SELECT
        USING (
          auth.uid() IN (
            SELECT auth_id FROM residents WHERE id = maintenance_requests.resident_id
          )
        );
      `)

      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Residents can create maintenance requests"
        ON maintenance_requests FOR INSERT
        WITH CHECK (
          auth.uid() IN (
            SELECT auth_id FROM residents WHERE id = maintenance_requests.resident_id
          )
        );
      `)

      // Residents can read public documents for their community
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Residents can read public documents"
        ON documents FOR SELECT
        USING (
          (is_public = true AND auth.uid() IN (
            SELECT auth_id FROM residents WHERE community_id = documents.community_id
          ))
        );
      `)

      // Add public access policy for anonymous users
      console.log("Creating public access policies...")
      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Public access to communities"
        ON communities FOR SELECT
        USING (true);
      `)

      await supabase.query(`
        CREATE POLICY IF NOT EXISTS "Public access to tasks"
        ON tasks FOR SELECT
        USING (true);
      `)

      return NextResponse.json({ success: true, message: "Database setup complete!" })
    } catch (error) {
      console.error("Error setting up database:", error)
      return NextResponse.json({ error: "Error setting up database", details: error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
