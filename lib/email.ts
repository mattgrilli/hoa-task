import nodemailer from "nodemailer"
import { createServerClient } from "@/lib/auth"
import { EMAIL_SERVER, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, APP_URL } from "@/lib/env"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_SERVER,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
})

export async function sendTaskAssignmentEmail(taskId: string, staffId: string) {
  const supabase = createServerClient()

  // Get task details
  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name)
    `)
    .eq("id", taskId)
    .single()

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`)
  }

  // Get staff details
  const { data: staff } = await supabase.from("staff").select("*").eq("id", staffId).single()

  if (!staff) {
    throw new Error(`Staff with ID ${staffId} not found`)
  }

  const communityName = task.communities?.name || "Unknown Community"

  // Email content
  const mailOptions = {
    from: `"HOA Task Manager" <${EMAIL_FROM || "noreply@example.com"}>`,
    to: staff.email,
    subject: `New Task Assignment: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Task Assignment</h2>
        <p>Hello ${staff.name},</p>
        <p>You have been assigned a new task in the HOA Task Manager:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p><strong>Community:</strong> ${communityName}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${task.description || "No description provided."}</p>
        </div>
        
        <p>Please log in to the HOA Task Manager to view the complete details and manage this task.</p>
        
        <div style="margin-top: 30px;">
          <a href="${APP_URL}/tasks/${taskId}" 
             style="background-color: #0070f3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View Task
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is an automated message from the HOA Task Manager. Please do not reply to this email.
        </p>
      </div>
    `,
  }

  // Send email
  return transporter.sendMail(mailOptions)
}

export async function sendTaskUpdateEmail(taskId: string, updateContent: string, recipientIds: string[]) {
  const supabase = createServerClient()

  // Get task details
  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name, email)
    `)
    .eq("id", taskId)
    .single()

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`)
  }

  // Get staff details
  const { data: recipients } = await supabase.from("staff").select("name, email").in("id", recipientIds)

  if (!recipients || recipients.length === 0) {
    throw new Error("No valid recipients found")
  }

  const communityName = task.communities?.name || "Unknown Community"
  const recipientEmails = recipients.map((r) => r.email)

  // Email content
  const mailOptions = {
    from: `"HOA Task Manager" <${EMAIL_FROM || "noreply@example.com"}>`,
    to: recipientEmails.join(", "),
    subject: `Task Update: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Task Update</h2>
        <p>Hello,</p>
        <p>There has been an update to a task in the HOA Task Manager:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p><strong>Community:</strong> ${communityName}</p>
          <p><strong>Assigned To:</strong> ${task.staff?.name || "Unassigned"}</p>
          <p><strong>Update:</strong> ${updateContent}</p>
        </div>
        
        <p>Please log in to the HOA Task Manager to view the complete details and manage this task.</p>
        
        <div style="margin-top: 30px;">
          <a href="${APP_URL}/tasks/${taskId}" 
             style="background-color: #0070f3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View Task
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is an automated message from the HOA Task Manager. Please do not reply to this email.
        </p>
      </div>
    `,
  }

  // Send email
  return transporter.sendMail(mailOptions)
}

export async function sendTaskStatusChangeEmail(taskId: string, newStatus: string) {
  const supabase = createServerClient()

  // Get task details
  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      communities:community_id(name),
      staff:assigned_to(name, email),
      creator:created_by(name, email)
    `)
    .eq("id", taskId)
    .single()

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`)
  }

  // Determine recipients (assigned staff and creator)
  const recipients = []

  if (task.staff?.email) {
    recipients.push(task.staff.email)
  }

  if (task.creator?.email && task.creator.email !== task.staff?.email) {
    recipients.push(task.creator.email)
  }

  if (recipients.length === 0) {
    throw new Error("No valid recipients found")
  }

  const communityName = task.communities?.name || "Unknown Community"

  // Email content
  const mailOptions = {
    from: `"HOA Task Manager" <${EMAIL_FROM || "noreply@example.com"}>`,
    to: recipients.join(", "),
    subject: `Task Status Changed: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Task Status Update</h2>
        <p>Hello,</p>
        <p>The status of a task has been updated in the HOA Task Manager:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p><strong>Community:</strong> ${communityName}</p>
          <p><strong>Assigned To:</strong> ${task.staff?.name || "Unassigned"}</p>
          <p><strong>New Status:</strong> <span style="font-weight: bold; color: ${
            newStatus.toLowerCase() === "completed" ? "green" : newStatus.toLowerCase() === "overdue" ? "red" : "blue"
          };">${newStatus}</span></p>
        </div>
        
        <p>Please log in to the HOA Task Manager to view the complete details and manage this task.</p>
        
        <div style="margin-top: 30px;">
          <a href="${APP_URL}/tasks/${taskId}" 
             style="background-color: #0070f3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View Task
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is an automated message from the HOA Task Manager. Please do not reply to this email.
        </p>
      </div>
    `,
  }

  // Send email
  return transporter.sendMail(mailOptions)
}
