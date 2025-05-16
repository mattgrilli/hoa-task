"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function RecentTasks() {
  const [page, setPage] = useState(1)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()
  const tasksPerPage = 5

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true)

        // Get total count for pagination
        const { count, error: countError } = await supabase.from("tasks").select("*", { count: "exact", head: true })

        if (countError) throw countError
        setTotalCount(count || 0)

        // Fetch tasks with pagination
        const { data, error } = await supabase
          .from("tasks")
          .select(`
            *,
            communities:community_id(name),
            staff:assigned_to(name)
          `)
          .order("created_at", { ascending: false })
          .range((page - 1) * tasksPerPage, page * tasksPerPage - 1)

        if (error) throw error

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

        setTasks(transformedData)
      } catch (error: any) {
        console.error("Error loading tasks:", error)
        toast({
          title: "Error loading tasks",
          description: error.message || "Failed to load tasks",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [page, toast])

  const totalPages = Math.ceil(totalCount / tasksPerPage)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading tasks...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <Link href={`/tasks/${task.id}`} className="hover:underline">
                          {task.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">{task.id.substring(0, 8)}</div>
                      </TableCell>
                      <TableCell>{task.community}</TableCell>
                      <TableCell>{task.assignedTo || "Unassigned"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status) as any}>{task.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {totalCount > 0 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
