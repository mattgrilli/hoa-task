"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { getTasks } from "@/app/actions/tasks"

export function TaskList() {
  const [page, setPage] = useState(1)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const tasksPerPage = 10

  useEffect(() => {
    async function loadTasks() {
      try {
        const tasksData = await getTasks()
        setTasks(tasksData || [])
        setLoading(false)
      } catch (error) {
        console.error("Error loading tasks:", error)
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  const totalPages = Math.ceil(tasks.length / tasksPerPage)
  const displayedTasks = tasks.slice((page - 1) * tasksPerPage, page * tasksPerPage)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>View and manage tasks across all communities.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading tasks...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">
                    <Checkbox id="select-all" />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {tasks.length === 0
                        ? "No tasks found. Create your first task to get started."
                        : "No tasks match your criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Checkbox id={`select-${task.id}`} />
                      </TableCell>
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
                      <TableCell>
                        <Badge variant={getPriorityColor(task.priority) as any}>{task.priority}</Badge>
                      </TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link href={`/tasks/${task.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Change Status</DropdownMenuItem>
                            <DropdownMenuItem>Reassign Task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {tasks.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * tasksPerPage + 1} to {Math.min(page * tasksPerPage, tasks.length)} of{" "}
                  {tasks.length} tasks
                </div>
                <div className="flex items-center space-x-2">
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
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
