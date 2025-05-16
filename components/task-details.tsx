"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Download, PaperclipIcon, SendIcon } from "lucide-react"
import { getTaskById, updateTask, addTaskUpdate } from "@/app/actions/tasks"
import { exportTaskToPdf } from "@/lib/pdf-export"
import { useToast } from "@/components/ui/use-toast"

interface TaskDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  taskId: string
}

export function TaskDetails({ className, taskId }: TaskDetailsProps) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newUpdate, setNewUpdate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadTask() {
      try {
        const taskData = await getTaskById(taskId)
        setTask(taskData)
        setLoading(false)
      } catch (error) {
        console.error(`Error loading task ${taskId}:`, error)
        setLoading(false)
      }
    }

    loadTask()
  }, [taskId])

  const handleStatusChange = async (status: string) => {
    try {
      await updateTask(taskId, { status })
      // Refresh the task data
      const updatedTask = await getTaskById(taskId)
      setTask(updatedTask)
      toast({
        title: "Status updated",
        description: `Task status changed to ${status}`,
      })
    } catch (error) {
      console.error(`Error updating task status:`, error)
      toast({
        title: "Error updating status",
        description: "There was a problem updating the task status",
        variant: "destructive",
      })
    }
  }

  const handlePriorityChange = async (priority: string) => {
    try {
      await updateTask(taskId, { priority })
      // Refresh the task data
      const updatedTask = await getTaskById(taskId)
      setTask(updatedTask)
      toast({
        title: "Priority updated",
        description: `Task priority changed to ${priority}`,
      })
    } catch (error) {
      console.error(`Error updating task priority:`, error)
      toast({
        title: "Error updating priority",
        description: "There was a problem updating the task priority",
        variant: "destructive",
      })
    }
  }

  const handleSubmitUpdate = async () => {
    if (!newUpdate.trim()) return

    setSubmitting(true)
    try {
      await addTaskUpdate(taskId, newUpdate)
      setNewUpdate("")
      // Refresh the task data
      const updatedTask = await getTaskById(taskId)
      setTask(updatedTask)
      toast({
        title: "Update posted",
        description: "Your update has been added to the task",
      })
    } catch (error) {
      console.error(`Error adding task update:`, error)
      toast({
        title: "Error posting update",
        description: "There was a problem adding your update",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportPdf = async () => {
    if (!task) return

    setExporting(true)
    try {
      const result = await exportTaskToPdf(taskId, task.title)
      if (result) {
        toast({
          title: "PDF exported",
          description: "Task details have been exported as PDF",
        })
      } else {
        throw new Error("Failed to export PDF")
      }
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting the task as PDF",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success"
      case "in progress":
        return "secondary"
      case "pending":
        return "default"
      case "overdue":
        return "destructive"
      default:
        return "default"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">Loading task details...</div>
        </CardContent>
      </Card>
    )
  }

  if (!task) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">Task not found</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardContent className="p-6">
        <div className="space-y-6" id="task-details-container">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{task.title}</h2>
              <p className="text-sm text-muted-foreground">
                Task ID: {task.id.substring(0, 8)} • Created on {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Community</h3>
              <p>{task.community}</p>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Assigned To</h3>
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignedTo.avatar || "/placeholder.svg"} alt="Avatar" />
                    <AvatarFallback>
                      {task.assignedTo.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{task.assignedTo.name}</p>
                    <p className="text-xs text-muted-foreground">{task.assignedTo.role}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 font-medium">Status</h3>
              <Select defaultValue={task.status.toLowerCase().replace(" ", "-")} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(task.status) as any}>{task.status}</Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <Badge variant="default">Pending</Badge>
                  </SelectItem>
                  <SelectItem value="in progress">
                    <Badge variant="secondary">In Progress</Badge>
                  </SelectItem>
                  <SelectItem value="completed">
                    <Badge variant="success">Completed</Badge>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <Badge variant="destructive">Overdue</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Priority</h3>
              <Select defaultValue={task.priority.toLowerCase()} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority) as any}>{task.priority}</Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <Badge variant="destructive">High</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="warning">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="low">
                    <Badge variant="secondary">Low</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Due Date</h3>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Description</h3>
            <p className="whitespace-pre-line">{task.description || "No description provided."}</p>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Attachments</h3>
              <div className="space-y-2">
                {task.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{attachment.name}</span>
                      <span className="text-xs text-muted-foreground">({attachment.size})</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-4 font-medium">Add Update</h3>
          <div className="space-y-2">
            <Textarea
              placeholder="Type your update here..."
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm">
                <PaperclipIcon className="mr-2 h-4 w-4" />
                Attach File
              </Button>
              <Button size="sm" onClick={handleSubmitUpdate} disabled={submitting || !newUpdate.trim()}>
                <SendIcon className="mr-2 h-4 w-4" />
                {submitting ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
