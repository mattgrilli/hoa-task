"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getTasks } from "@/app/actions/tasks"

interface UpcomingDeadlinesProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UpcomingDeadlines({ className }: UpcomingDeadlinesProps) {
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDeadlines() {
      try {
        const tasks = await getTasks()

        // Filter for upcoming tasks and sort by due date
        const now = new Date()
        const upcoming = tasks
          .filter((task) => {
            const dueDate = new Date(task.dueDate)
            return dueDate >= now && task.status.toLowerCase() !== "completed"
          })
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 4) // Take only the next 4 deadlines

        setDeadlines(
          upcoming.map((task) => ({
            id: task.id,
            title: task.title,
            community: task.community,
            dueDate: task.dueDate,
            priority: task.priority,
          })),
        )

        setLoading(false)
      } catch (error) {
        console.error("Error loading upcoming deadlines:", error)
        setLoading(false)
      }
    }

    loadDeadlines()
  }, [])

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading deadlines...</div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No upcoming deadlines</div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <div key={deadline.id} className="flex flex-col space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{deadline.title}</span>
                  <Badge variant={deadline.priority.toLowerCase() === "high" ? "destructive" : "secondary"}>
                    {deadline.priority}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{deadline.community}</div>
                <div className="text-sm">Due: {new Date(deadline.dueDate).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
