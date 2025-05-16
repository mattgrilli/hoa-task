"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function AddTaskForm() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [communityId, setCommunityId] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [status, setStatus] = useState("pending")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [communities, setCommunities] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch communities
        const { data: communitiesData, error: communitiesError } = await supabase
          .from("communities")
          .select("id, name")
          .order("name")

        if (communitiesError) throw communitiesError
        setCommunities(communitiesData || [])

        // Fetch staff
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("id, name, role")
          .order("name")

        if (staffError) throw staffError
        setStaff(staffData || [])
      } catch (error: any) {
        console.error("Error loading form data:", error)
        setError("Failed to load form data. Please try again.")
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Task title is required")
      return
    }

    if (!communityId) {
      setError("Community is required")
      return
    }

    if (!dueDate) {
      setError("Due date is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Get current user's auth ID
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Get staff ID from auth ID
      let createdBy = null
      if (session?.user?.id) {
        const { data: staffData } = await supabase.from("staff").select("id").eq("auth_id", session.user.id).single()

        if (staffData) {
          createdBy = staffData.id
        }
      }

      // Insert task
      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            description,
            status,
            priority,
            due_date: dueDate,
            community_id: communityId,
            assigned_to: assignedTo || null,
            created_by: createdBy,
          },
        ])
        .select()

      if (insertError) throw insertError

      // Add task creation update
      if (data && data[0]?.id) {
        await supabase.from("task_updates").insert([
          {
            task_id: data[0].id,
            user_id: createdBy,
            content: "Task created",
            update_type: "created",
          },
        ])
      }

      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCommunityId("")
      setAssignedTo("")
      setStatus("pending")
      setPriority("medium")
      setDueDate("")

      // Close dialog
      setOpen(false)

      // Refresh page
      router.refresh()
    } catch (err: any) {
      console.error("Error creating task:", err)
      setError(err.message || "An error occurred while creating the task")

      toast({
        title: "Error creating task",
        description: err.message || "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to assign to community managers or assistants.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="community">Community</Label>
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger id="community">
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
