"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getTaskById } from "@/app/actions/tasks"
import { useEffect, useState } from "react"

interface TaskUpdatesProps extends React.HTMLAttributes<HTMLDivElement> {
  taskId: string
}

export function TaskUpdates({ className, taskId }: TaskUpdatesProps) {
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUpdates() {
      try {
        const task = await getTaskById(taskId)
        if (task && task.updates) {
          setUpdates(task.updates)
        }
        setLoading(false)
      } catch (error) {
        console.error(`Error loading updates for task ${taskId}:`, error)
        setLoading(false)
      }
    }

    loadUpdates()
  }, [taskId])

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No updates yet</div>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="relative pl-6">
                <div className="absolute left-0 top-0 h-full w-[2px] bg-muted" />
                <div className="absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-primary" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={update.user.avatar || "/placeholder.svg"} alt="Avatar" />
                      <AvatarFallback>{update.user.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{update.user.name}</span>
                    {update.type !== "update" && (
                      <Badge variant="outline" className="text-xs">
                        {update.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{update.content}</p>
                  <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
