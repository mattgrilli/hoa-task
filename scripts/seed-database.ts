import { createClient } from "@supabase/supabase-js"

async function seedDatabase() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_API_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("Seeding database with initial data...")

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
    {
      name: "Riverside Heights",
      address: "321 River Road",
      city: "Springfield",
      state: "IL",
      zip: "62703",
      units: 92,
    },
    {
      name: "Sunnyvale Terrace",
      address: "654 Sunset Boulevard",
      city: "Springfield",
      state: "IL",
      zip: "62704",
      units: 110,
    },
  ]

  const { data: communitiesData, error: communitiesError } = await supabase
    .from("communities")
    .insert(communities)
    .select()

  if (communitiesError) {
    console.error("Error adding communities:", communitiesError)
    return
  }

  console.log("Added communities:", communitiesData.length)

  // Create auth users for staff
  const staffUsers = [
    {
      email: "john.smith@example.com",
      password: "password123",
      user_metadata: { name: "John Smith", role: "Community Manager" },
    },
    {
      email: "sarah.johnson@example.com",
      password: "password123",
      user_metadata: { name: "Sarah Johnson", role: "Community Manager" },
    },
    {
      email: "emily.davis@example.com",
      password: "password123",
      user_metadata: { name: "Emily Davis", role: "Community Assistant" },
    },
    {
      email: "michael.brown@example.com",
      password: "password123",
      user_metadata: { name: "Michael Brown", role: "Community Manager" },
    },
    {
      email: "david.wilson@example.com",
      password: "password123",
      user_metadata: { name: "David Wilson", role: "Community Assistant" },
    },
  ]

  const staffAuthIds = []
  for (const staffUser of staffUsers) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: staffUser.email,
      password: staffUser.password,
      user_metadata: staffUser.user_metadata,
      email_confirm: true,
    })

    if (authError) {
      console.error(`Error creating auth user for ${staffUser.email}:`, authError)
      continue
    }

    staffAuthIds.push({
      email: staffUser.email,
      auth_id: authData.user.id,
      name: staffUser.user_metadata.name,
      role: staffUser.user_metadata.role,
    })
  }

  // Add staff
  const staff = staffAuthIds.map((staff) => ({
    auth_id: staff.auth_id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    avatar_url: "/abstract-geometric-shapes.png",
    notification_preferences: {
      taskAssignments: true,
      taskUpdates: true,
      statusChanges: true,
      dueDateReminders: true,
      communityUpdates: false,
      dailyDigest: false,
    },
  }))

  const { data: staffData, error: staffError } = await supabase.from("staff").insert(staff).select()

  if (staffError) {
    console.error("Error adding staff:", staffError)
    return
  }

  console.log("Added staff:", staffData.length)

  // Assign staff to communities
  const staffCommunities = [
    { staff_id: staffData[0].id, community_id: communitiesData[0].id, role: "manager" }, // John - Oakridge
    { staff_id: staffData[0].id, community_id: communitiesData[2].id, role: "manager" }, // John - Meadowbrook
    { staff_id: staffData[1].id, community_id: communitiesData[1].id, role: "manager" }, // Sarah - Pinecrest
    { staff_id: staffData[1].id, community_id: communitiesData[4].id, role: "manager" }, // Sarah - Sunnyvale
    { staff_id: staffData[2].id, community_id: communitiesData[0].id, role: "assistant" }, // Emily - Oakridge
    { staff_id: staffData[2].id, community_id: communitiesData[3].id, role: "assistant" }, // Emily - Riverside
    { staff_id: staffData[3].id, community_id: communitiesData[2].id, role: "manager" }, // Michael - Meadowbrook
    { staff_id: staffData[4].id, community_id: communitiesData[3].id, role: "assistant" }, // David - Riverside
    { staff_id: staffData[4].id, community_id: communitiesData[4].id, role: "assistant" }, // David - Sunnyvale
  ]

  const { data: staffCommunitiesData, error: staffCommunitiesError } = await supabase
    .from("staff_communities")
    .insert(staffCommunities)
    .select()

  if (staffCommunitiesError) {
    console.error("Error assigning staff to communities:", staffCommunitiesError)
    return
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
      description: "Coordinate with the inspection company to schedule the annual property inspection for all units.",
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
      created_by: staffData[3].id,
    },
    {
      title: "Update Community Newsletter",
      description:
        "Prepare the monthly newsletter with updates on community events, maintenance schedules, and board decisions.",
      status: "In Progress",
      priority: "Medium",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4).toISOString().split("T")[0],
      community_id: communitiesData[3].id,
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
      community_id: communitiesData[4].id,
      assigned_to: staffData[3].id,
      created_by: staffData[1].id,
    },
    {
      title: "Prepare Board Meeting Agenda",
      description: "Compile agenda items for the upcoming board meeting and distribute to board members for review.",
      status: "In Progress",
      priority: "Medium",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12).toISOString().split("T")[0],
      community_id: communitiesData[0].id,
      assigned_to: staffData[1].id,
      created_by: staffData[0].id,
    },
    {
      title: "Follow up on Maintenance Request #78",
      description: "Contact the plumbing contractor regarding the leak in unit 156 and schedule the repair.",
      status: "Pending",
      priority: "Low",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20).toISOString().split("T")[0],
      community_id: communitiesData[1].id,
      assigned_to: staffData[0].id,
      created_by: staffData[1].id,
    },
    {
      title: "Coordinate Pool Opening",
      description:
        "Schedule pool maintenance, inspection, and prepare for seasonal opening. Update residents on new pool rules.",
      status: "In Progress",
      priority: "High",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString().split("T")[0],
      community_id: communitiesData[2].id,
      assigned_to: staffData[2].id,
      created_by: staffData[3].id,
    },
    {
      title: "Review Financial Statements",
      description: "Review monthly financial statements and prepare summary for board review.",
      status: "Pending",
      priority: "Medium",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString().split("T")[0],
      community_id: communitiesData[3].id,
      assigned_to: staffData[3].id,
      created_by: staffData[4].id,
    },
    {
      title: "Update Resident Directory",
      description: "Update the community resident directory with new homeowners and contact information changes.",
      status: "Completed",
      priority: "Low",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString().split("T")[0],
      community_id: communitiesData[4].id,
      assigned_to: staffData[4].id,
      created_by: staffData[1].id,
    },
    {
      title: "Schedule Landscaping Service",
      description: "Coordinate with landscaping company for spring cleanup and flower planting.",
      status: "In Progress",
      priority: "Medium",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString().split("T")[0],
      community_id: communitiesData[0].id,
      assigned_to: staffData[0].id,
      created_by: staffData[0].id,
    },
    {
      title: "Organize Community Event",
      description: "Plan and organize the summer community picnic. Book vendors, entertainment, and send invitations.",
      status: "Pending",
      priority: "Medium",
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 35).toISOString().split("T")[0],
      community_id: communitiesData[1].id,
      assigned_to: staffData[1].id,
      created_by: staffData[1].id,
    },
  ]

  const { data: tasksData, error: tasksError } = await supabase.from("tasks").insert(tasks).select()

  if (tasksError) {
    console.error("Error adding tasks:", tasksError)
    return
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
    return
  }

  console.log("Added task updates:", updatesData.length)

  // Create auth users for residents
  const residentUsers = [
    {
      email: "resident1@example.com",
      password: "password123",
      user_metadata: { name: "Alex Johnson", unit: "101" },
    },
    {
      email: "resident2@example.com",
      password: "password123",
      user_metadata: { name: "Taylor Smith", unit: "202" },
    },
    {
      email: "resident3@example.com",
      password: "password123",
      user_metadata: { name: "Jordan Williams", unit: "303" },
    },
  ]

  const residentAuthIds = []
  for (const residentUser of residentUsers) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: residentUser.email,
      password: residentUser.password,
      user_metadata: residentUser.user_metadata,
      email_confirm: true,
    })

    if (authError) {
      console.error(`Error creating auth user for ${residentUser.email}:`, authError)
      continue
    }

    residentAuthIds.push({
      email: residentUser.email,
      auth_id: authData.user.id,
      name: residentUser.user_metadata.name,
      unit: residentUser.user_metadata.unit,
    })
  }

  // Add residents
  const residents = residentAuthIds.map((resident, index) => ({
    auth_id: resident.auth_id,
    name: resident.name,
    email: resident.email,
    phone: `555-${100 + index}`,
    community_id: communitiesData[index % communitiesData.length].id,
    unit_number: resident.unit,
    notification_preferences: {
      maintenanceUpdates: true,
      communityAnnouncements: true,
      paymentReminders: true,
    },
  }))

  const { data: residentsData, error: residentsError } = await supabase.from("residents").insert(residents).select()

  if (residentsError) {
    console.error("Error adding residents:", residentsError)
    return
  }

  console.log("Added residents:", residentsData.length)

  // Add maintenance requests
  const maintenanceRequests = [
    {
      title: "Leaking Faucet",
      description: "The kitchen faucet is leaking and causing water damage to the cabinet below.",
      status: "Pending",
      priority: "Medium",
      community_id: communitiesData[0].id,
      resident_id: residentsData[0].id,
      unit_number: residentsData[0].unit_number,
    },
    {
      title: "HVAC Not Working",
      description: "The air conditioning unit is not cooling properly. Temperature remains high even when set to low.",
      status: "In Progress",
      priority: "High",
      community_id: communitiesData[1].id,
      resident_id: residentsData[1].id,
      assigned_to: staffData[1].id,
      unit_number: residentsData[1].unit_number,
    },
    {
      title: "Broken Window",
      description: "The window in the living room has a crack and needs to be replaced.",
      status: "Completed",
      priority: "Medium",
      community_id: communitiesData[2].id,
      resident_id: residentsData[2].id,
      assigned_to: staffData[2].id,
      unit_number: residentsData[2].unit_number,
      completed_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(),
    },
  ]

  const { data: maintenanceData, error: maintenanceError } = await supabase
    .from("maintenance_requests")
    .insert(maintenanceRequests)
    .select()

  if (maintenanceError) {
    console.error("Error adding maintenance requests:", maintenanceError)
    return
  }

  console.log("Added maintenance requests:", maintenanceData.length)

  // Add announcements
  const announcements = [
    {
      title: "Annual HOA Meeting",
      content:
        "The annual HOA meeting will be held on June 15th at 7:00 PM in the community center. All homeowners are encouraged to attend.",
      community_id: communitiesData[0].id,
      created_by: staffData[0].id,
      published_at: new Date().toISOString(),
      expires_at: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString(),
    },
    {
      title: "Pool Opening",
      content:
        "The community pool will open for the season on May 28th. Please review the updated pool rules on the community website.",
      community_id: communitiesData[1].id,
      created_by: staffData[1].id,
      published_at: new Date().toISOString(),
      expires_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString(),
    },
    {
      title: "Landscaping Schedule",
      content:
        "The landscaping company will be performing spring cleanup and flower planting on May 20th and 21st. Please ensure personal items are removed from common areas.",
      community_id: communitiesData[2].id,
      created_by: staffData[2].id,
      published_at: new Date().toISOString(),
      expires_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString(),
    },
  ]

  const { data: announcementsData, error: announcementsError } = await supabase
    .from("announcements")
    .insert(announcements)
    .select()

  if (announcementsError) {
    console.error("Error adding announcements:", announcementsError)
    return
  }

  console.log("Added announcements:", announcementsData.length)

  // Add events
  const events = [
    {
      title: "Community Picnic",
      description: "Annual community picnic with food, games, and entertainment for all residents.",
      location: "Community Park",
      start_time: new Date(now.getFullYear(), now.getMonth() + 1, 15, 12, 0).toISOString(),
      end_time: new Date(now.getFullYear(), now.getMonth() + 1, 15, 16, 0).toISOString(),
      community_id: communitiesData[0].id,
      created_by: staffData[0].id,
    },
    {
      title: "Board Meeting",
      description: "Monthly board meeting to discuss community matters and upcoming projects.",
      location: "Community Center",
      start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 19, 0).toISOString(),
      end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 21, 0).toISOString(),
      community_id: communitiesData[1].id,
      created_by: staffData[1].id,
    },
    {
      title: "Pool Party",
      description: "Summer kickoff pool party with music, food, and games.",
      location: "Community Pool",
      start_time: new Date(now.getFullYear(), now.getMonth() + 1, 5, 14, 0).toISOString(),
      end_time: new Date(now.getFullYear(), now.getMonth() + 1, 5, 18, 0).toISOString(),
      community_id: communitiesData[2].id,
      created_by: staffData[2].id,
    },
  ]

  const { data: eventsData, error: eventsError } = await supabase.from("events").insert(events).select()

  if (eventsError) {
    console.error("Error adding events:", eventsError)
    return
  }

  console.log("Added events:", eventsData.length)

  console.log("Database seeding complete!")
}

seedDatabase()
  .then(() => {
    console.log("Database seed script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error in database seed:", error)
    process.exit(1)
  })
