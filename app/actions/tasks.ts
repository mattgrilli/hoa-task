"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendTaskAssignmentEmail, sendTaskStatusChangeEmail, sendTaskUpdateEmail } from "@/lib/email"

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name)
    `)
    .order("due_date")

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Transform the data to match the expected format
  const transformedData = data.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    community: task.communities?.name,
    communityId: task.community_id,
    assignedTo: task.staff?.name,
    assignedToId: task.assigned_to,
    createdAt: task.created_at,
  }))

  return transformedData
}

export async function getTasksByStatus(status: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name)
    `)
    .eq("status", status)
    .order("due_date")

  if (error) {
    console.error(`Error fetching tasks with status ${status}:`, error)
    return []
  }

  // Transform the data to match the expected format
  const transformedData = data.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    community: task.communities?.name,
    communityId: task.community_id,
    assignedTo: task.staff?.name,
    assignedToId: task.assigned_to,
    createdAt: task.created_at,
  }))

  return transformedData
}

export async function getTasksByCommunity(communityId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name)
    `)
    .eq("community_id", communityId)
    .order("due_date")

  if (error) {
    console.error(`Error fetching tasks for community ${communityId}:`, error)
    return []
  }

  // Transform the data to match the expected format
  const transformedData = data.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    community: task.communities?.name,
    communityId: task.community_id,
    assignedTo: task.staff?.name,
    assignedToId: task.assigned_to,
    createdAt: task.created_at,
  }))

  return transformedData
}

export async function getTasksByAssignee(staffId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name)
    `)
    .eq("assigned_to", staffId)
    .order("due_date")

  if (error) {
    console.error(`Error fetching tasks for staff ${staffId}:`, error)
    return []
  }

  // Transform the data to match the expected format
  const transformedData = data.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    community: task.communities?.name,
    communityId: task.community_id,
    assignedTo: task.staff?.name,
    assignedToId: task.assigned_to,
    createdAt: task.created_at,
  }))

  return transformedData
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name, email, role, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching task ${id}:`, error)
    return null
  }

  // Get task updates
  const { data: updatesData, error: updatesError } = await supabase
    .from("task_updates")
    .select(`
      *,
      staff:user_id(name, avatar_url)
    `)
    .eq("task_id", id)
    .order("created_at", { ascending: false })

  if (updatesError) {
    console.error(`Error fetching updates for task ${id}:`, updatesError)
  }

  // Get task attachments
  const { data: attachmentsData, error: attachmentsError } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: false })

  if (attachmentsError) {
    console.error(`Error fetching attachments for task ${id}:`, attachmentsError)
  }

  // Transform the data to match the expected format
  const transformedTask = {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.due_date,
    community: data.communities?.name,
    communityId: data.community_id,
    assignedTo: {
      id: data.assigned_to,
      name: data.staff?.name,
      email: data.staff?.email,
      role: data.staff?.role,
      avatar: data.staff?.avatar_url,
    },
    createdAt: data.created_at,
    updates: updatesData
      ? updatesData.map((update: any) => ({
          id: update.id,
          content: update.content,
          type: update.update_type,
          timestamp: update.created_at,
          user: update.staff
            ? {
                name: update.staff.name,
                avatar: update.staff.avatar_url,
                initials: update.staff.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join(""),
              }
            : {
                name: "System",
                avatar: "",
                initials: "SYS",
              },
        }))
      : [],
    attachments: attachmentsData
      ? attachmentsData.map((attachment: any) => ({
          name: attachment.file_name,
          size: attachment.file_size,
          url: attachment.file_url,
        }))
      : [],
  }

  return transformedTask
}

export async function createTask(
  title: string,
  communityId: string,
  status: string,
  priority: string,
  dueDate: string,
  description?: string,
  assignedTo?: string,
  createdBy?: string,
) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        community_id: communityId,
        status,
        priority,
        due_date: dueDate,
        description,
        assigned_to: assignedTo,
        created_by: createdBy,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  // Add a task creation update
  if (data[0].id) {
    await supabase.from("task_updates").insert([
      {
        task_id: data[0].id,
        user_id: createdBy,
        content: "Task created",
        update_type: "created",
      },
    ])

    // Send email notification if task is assigned
    if (assignedTo) {
      try {
        await sendTaskAssignmentEmail(data[0].id, assignedTo)
      } catch (emailError) {
        console.error("Error sending assignment email:", emailError)
      }
    }
  }

  revalidatePath("/tasks")
  return data[0]
}

export async function updateTask(
  id: string,
  updates: {
    title?: string
    description?: string
    status?: string
    priority?: string
    due_date?: string
    community_id?: string
    assigned_to?: string
  },
  userId?: string,
) {
  // Get the current task state before updating
  const { data: currentTask } = await supabase.from("tasks").select("*").eq("id", id).single()

  if (!currentTask) {
    console.error(`Task ${id} not found`)
    return null
  }

  const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select()

  if (error) {
    console.error(`Error updating task ${id}:`, error)
    return null
  }

  // Add a task update for each changed field
  const updateMessages = []

  // Check if status changed
  if (updates.status && updates.status !== currentTask.status) {
    updateMessages.push(`Status changed to ${updates.status}`)

    // Send status change email
    try {
      await sendTaskStatusChangeEmail(id, updates.status)
    } catch (emailError) {
      console.error("Error sending status change email:", emailError)
    }
  }

  // Check if priority changed
  if (updates.priority && updates.priority !== currentTask.priority) {
    updateMessages.push(`Priority changed to ${updates.priority}`)
  }

  // Check if assignee changed
  if (updates.assigned_to && updates.assigned_to !== currentTask.assigned_to) {
    updateMessages.push(`Assignee changed`)

    // Send assignment email to new assignee
    if (updates.assigned_to) {
      try {
        await sendTaskAssignmentEmail(id, updates.assigned_to)
      } catch (emailError) {
        console.error("Error sending assignment email:", emailError)
      }
    }
  }

  if (updateMessages.length > 0) {
    await supabase.from("task_updates").insert(
      updateMessages.map((message) => ({
        task_id: id,
        user_id: userId,
        content: message,
        update_type: "status",
      })),
    )
  }

  revalidatePath("/tasks")
  revalidatePath(`/tasks/${id}`)
  return data[0]
}

export async function addTaskUpdate(taskId: string, content: string, userId?: string, updateType = "update") {
  const { data, error } = await supabase
    .from("task_updates")
    .insert([
      {
        task_id: taskId,
        user_id: userId,
        content,
        update_type: updateType,
      },
    ])
    .select()

  if (error) {
    console.error(`Error adding update to task ${taskId}:`, error)
    return null
  }

  // Get task details to determine who should receive email notifications
  const { data: task } = await supabase
    .from("tasks")
    .select(`
      assigned_to,
      created_by
    `)
    .eq("id", taskId)
    .single()

  if (task) {
    const recipientIds = []

    // Include assignee if exists and is not the current user
    if (task.assigned_to && task.assigned_to !== userId) {
      recipientIds.push(task.assigned_to)
    }

    // Include creator if exists and is not the current user or assignee
    if (task.created_by && task.created_by !== userId && task.created_by !== task.assigned_to) {
      recipientIds.push(task.created_by)
    }

    // Send email notification if there are recipients
    if (recipientIds.length > 0) {
      try {
        await sendTaskUpdateEmail(taskId, content, recipientIds)
      } catch (emailError) {
        console.error("Error sending update email:", emailError)
      }
    }
  }

  revalidatePath(`/tasks/${taskId}`)
  return data[0]
}

export async function addTaskAttachment(
  taskId: string,
  fileName: string,
  fileSize: string,
  fileUrl: string,
  userId?: string,
) {
  const { data, error } = await supabase
    .from("task_attachments")
    .insert([
      {
        task_id: taskId,
        file_name: fileName,
        file_size: fileSize,
        file_url: fileUrl,
        created_by: userId,
      },
    ])
    .select()

  if (error) {
    console.error(`Error adding attachment to task ${taskId}:`, error)
    return null
  }

  // Add a task update for the attachment
  await addTaskUpdate(taskId, `Added attachment: ${fileName}`, userId, "attachment")

  revalidatePath(`/tasks/${taskId}`)
  return data[0]
}
