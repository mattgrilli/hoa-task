import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "@/lib/env"

export async function createDatabaseFunctions() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Create a function to create the staff table if it doesn't exist
  const createStaffTableFunction = `
  CREATE OR REPLACE FUNCTION create_staff_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    -- Check if the staff table exists
    IF NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'staff'
    ) THEN
      -- Create the staff table
      CREATE TABLE public.staff (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        auth_id UUID UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        notification_preferences JSONB DEFAULT '{}'::jsonb,
        last_login TIMESTAMP WITH TIME ZONE
      );
      
      -- Add RLS policies
      ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
      
      -- Create policy to allow users to read their own staff record
      CREATE POLICY "Users can read their own staff record"
      ON public.staff
      FOR SELECT
      USING (auth.uid() = auth_id);
      
      -- Create policy to allow admins to read all staff records
      CREATE POLICY "Admins can read all staff records"
      ON public.staff
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.staff
          WHERE auth_id = auth.uid() AND (role = 'Admin' OR role = 'Super Admin')
        )
      );
      
      -- Create policy to allow admins to insert staff records
      CREATE POLICY "Admins can insert staff records"
      ON public.staff
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.staff
          WHERE auth_id = auth.uid() AND (role = 'Admin' OR role = 'Super Admin')
        )
      );
      
      -- Create policy to allow admins to update staff records
      CREATE POLICY "Admins can update staff records"
      ON public.staff
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.staff
          WHERE auth_id = auth.uid() AND (role = 'Admin' OR role = 'Super Admin')
        )
      );
      
      -- Create policy to allow admins to delete staff records
      CREATE POLICY "Admins can delete staff records"
      ON public.staff
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.staff
          WHERE auth_id = auth.uid() AND (role = 'Admin' OR role = 'Super Admin')
        )
      );
      
      -- Special policy for the first admin
      CREATE POLICY "Allow insert for the first admin"
      ON public.staff
      FOR INSERT
      WITH CHECK (
        NOT EXISTS (SELECT 1 FROM public.staff WHERE role = 'Admin')
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Execute the function creation
  const { error } = await supabase.rpc("create_staff_table_if_not_exists", {})

  if (error && !error.message.includes("does not exist")) {
    // If the function doesn't exist yet, create it
    const { error: createFunctionError } = await supabase.sql(createStaffTableFunction)
    if (createFunctionError) {
      console.error("Error creating function:", createFunctionError)
      return false
    }
  }

  return true
}
