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

    console.log("Seeding database with initial data...")

    try {
      // Add communities
      const communities = [
        {
          name: "Oakridge Estates",
          address: "123 Main Street",
          city: "Springfield",
          state: "IL",
          zip: "62704",
          units: 124,
        },
        {
          name: "Pinecrest Village",
          address: "456 Oak Avenue",
          city: "Springfield",
          state: "IL",
          zip: "62701",
          units: 86,
        },
        {
          name: "Meadowbrook Gardens",
          address: "789 Elm Street",
          city: "Springfield",
          state: "IL",
          zip: "62702",
          units: 156,
        },
      ]

      const { data: communitiesData, error: communitiesError } = await supabase
        .from("communities")
        .insert(communities)
        .select()

      if (communitiesError) {
        console.error("Error adding communities:", communitiesError)
        return NextResponse.json({ error: "Error adding communities", details: communitiesError }, { status: 500 })
      }

      console.log("Added communities:", communitiesData.length)

      // Add staff
      const staff = [
        {
          name: "John Smith",
          email: "john.smith@example.com",
          role: "Community Manager",
          avatar_url: "/abstract-geometric-shapes.png",
          notification_preferences: {
            taskAssignments: true,
            taskUpdates: true,
            statusChanges: true,
            dueDateReminders: true,
            communityUpdates: false,
            dailyDigest: false,
          },
        },
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          role: "Community Manager",
          avatar_url: "/abstract-geometric-shapes.png",
          notification_preferences: {
            taskAssignments: true,
            taskUpdates: true,
            statusChanges: true,
            dueDateReminders: true,
            communityUpdates: false,
            dailyDigest: false,
          },
        },
        {
          name: "Emily Davis",
          email: "emily.davis@example.com",
          role: "Community Assistant",
          avatar_url: "/abstract-geometric-shapes.png",
          notification_preferences: {
            taskAssignments: true,
            taskUpdates: true,
            statusChanges: true,
            dueDateReminders: true,
            communityUpdates: false,
            dailyDigest: false,
          },
        },
      ]

      const { data: staffData, error: staffError } = await supabase.from("staff").insert(staff).select()

      if (staffError) {
        console.error("Error adding staff:", staffError)
        return NextResponse.json({ error: "Error adding staff", details: staffError }, { status: 500 })
      }

      console.log("Added staff:", staffData.length)

      // Assign staff to communities
      const staffCommunities = [
        { staff_id: staffData[0].id, community_id: communitiesData[0].id, role: "manager" }, // John - Oakridge
        { staff_id: staffData[0].id, community_id: communitiesData[2].id, role: "manager" }, // John - Meadowbrook
        { staff_id: staffData[1].id, community_id: communitiesData[1].id, role: "manager" }, // Sarah - Pinecrest
        { staff_id: staffData[2].id, community_id: communitiesData[0].id, role: "assistant" }, // Emily - Oakridge
      ]

      const { data: staffCommunitiesData, error: staffCommunitiesError } = await supabase
        .from("staff_communities")
        .insert(staffCommunities)
        .select()

      if (staffCommunitiesError) {
        console.error("Error assigning staff to communities:", staffCommunitiesError)
        return NextResponse.json(
          { error: "Error assigning staff to communities", details: staffCommunitiesError },
          { status: 500 },
        )
      }

      console.log("Assigned staff to communities:", staffCommunitiesData.length)

      // Add tasks
      const now = new Date()
      const tasks = [
        {
          title: "Review HOA Bylaws Update",
          description:
            "Review the proposed changes to the HOA bylaws and provide feedback to the board. Focus on sections 3.2, 4.5, and 7.1 which have significant changes.",
          status: "In Progress",
          priority: "High",
          due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10).toISOString().split("T")[0],
          community_id: communitiesData[0].id,
          assigned_to: staffData[0].id,
          created_by: staffData[1].id,
        },
        {
          title: "Schedule Annual Inspection",
          description:
            "Coordinate with the inspection company to schedule the annual property inspection for all units.",
          status: "Pending",
          priority: "Medium",
          due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25).toISOString().split("T")[0],
          community_id: communitiesData[1].id,
          assigned_to: staffData[1].id,
          created_by: staffData[1].id,
        },
        {
          title: "Resolve Resident Complaint #45",
          description:
            "Follow up on noise complaint from unit 203 regarding unit 204. Schedule meeting with both residents.",
          status: "Completed",
          priority: "High",
          due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().split("T")[0],
          community_id: communitiesData[2].id,
          assigned_to: staffData[0].id,
          created_by: staffData[2].id,
        },
        {
          title: "Update Community Newsletter",
          description:
            "Prepare the monthly newsletter with updates on community events, maintenance schedules, and board decisions.",
          status: "In Progress",
          priority: "Medium",
          due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4).toISOString().split("T")[0],
          community_id: communitiesData[0].id,
          assigned_to: staffData[2].id,
          created_by: staffData[2].id,
        },
        {
          title: "Review Vendor Proposals",
          description:
            "Review and compare the three landscaping vendor proposals and prepare recommendation for the board.",
          status: "Overdue",
          priority: "High",
          due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString().split("T")[0],
          community_id: communitiesData[1].id,
          assigned_to: staffData[1].id,
          created_by: staffData[1].id,
        },
      ]

      const { data: tasksData, error: tasksError } = await supabase.from("tasks").insert(tasks).select()

      if (tasksError) {
        console.error("Error adding tasks:", tasksError)
        return NextResponse.json({ error: "Error adding tasks", details: tasksError }, { status: 500 })
      }

      console.log("Added tasks:", tasksData.length)

      // Add task updates
      const updates = []

      // Add updates for the first task
      updates.push({
        task_id: tasksData[0].id,
        user_id: staffData[0].id,
        content: "I've reviewed sections 3.2 and 4.5. Will complete section 7.1 by tomorrow.",
        update_type: "update",
        created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
      })

      updates.push({
        task_id: tasksData[0].id,
        user_id: null,
        content: "Status changed from Pending to In Progress",
        update_type: "status",
        created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(),
      })

      updates.push({
        task_id: tasksData[0].id,
        user_id: staffData[1].id,
        content: "Added attachment: bylaws_draft_v2.pdf",
        update_type: "attachment",
        created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
      })

      updates.push({
        task_id: tasksData[0].id,
        user_id: null,
        content: "Task created and assigned to John Smith",
        update_type: "created",
        created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString(),
      })

      // Add creation updates for all tasks
      for (let i = 1; i < tasksData.length; i++) {
        const creatorId = tasks[i].created_by
        const assigneeId = tasks[i].assigned_to
        const creatorName = staffData.find((s) => s.id === creatorId)?.name || "System"
        const assigneeName = staffData.find((s) => s.id === assigneeId)?.name || "no one"

        updates.push({
          task_id: tasksData[i].id,
          user_id: creatorId,
          content: `Task created and assigned to ${assigneeName}`,
          update_type: "created",
          created_at: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - Math.floor(Math.random() * 10),
          ).toISOString(),
        })
      }

      const { data: updatesData, error: updatesError } = await supabase.from("task_updates").insert(updates).select()

      if (updatesError) {
        console.error("Error adding task updates:", updatesError)
        return NextResponse.json({ error: "Error adding task updates", details: updatesError }, { status: 500 })
      }

      console.log("Added task updates:", updatesData.length)

      return NextResponse.json({ success: true, message: "Database seeding complete!" })
    } catch (error) {
      console.error("Error seeding database:", error)
      return NextResponse.json({ error: "Error seeding database", details: error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
