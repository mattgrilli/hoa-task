"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { getTasks, getTasksByStatus } from "@/app/actions/tasks"

interface TaskMetricsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskMetrics({ className }: TaskMetricsProps) {
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function loadMetrics() {
      try {
        const allTasks = await getTasks()
        const completedTasks = await getTasksByStatus("Completed")
        const overdueTasks = await getTasksByStatus("Overdue")

        const total = allTasks.length
        const completed = completedTasks.length
        const overdue = overdueTasks.length
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        setMetrics({
          total,
          completed,
          overdue,
          completionRate,
        })

        // Generate mock chart data
        // In a real app, this would come from actual task data grouped by month
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentMonth = new Date().getMonth()

        const data = months.map((name, index) => {
          // Generate some realistic looking data with an upward trend
          // and more tasks in recent months
          const baseValue = 10 + Math.floor(index * 1.5)
          const randomFactor = Math.random() * 10 - 5
          const recencyBoost = index <= currentMonth ? (currentMonth - index < 3 ? 8 : 0) : 0

          return {
            name,
            total: Math.max(5, Math.round(baseValue + randomFactor + recencyBoost)),
          }
        })

        setChartData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error loading task metrics:", error)
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  return (
    <Card className={cn("col-span-3", className)}>
      <CardHeader>
        <CardTitle>Task Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading metrics...</div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="completion">Completion Rate</TabsTrigger>
              <TabsTrigger value="overdue">Overdue Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.total}</div>
                    <p className="text-xs text-muted-foreground">Across all communities</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.completed}</div>
                    <p className="text-xs text-muted-foreground">{metrics.completionRate}% completion rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.overdue}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.total > 0 ? Math.round((metrics.overdue / metrics.total) * 100) : 0}% of total tasks
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="completion" className="h-[300px]">
              {/* Completion rate chart would go here */}
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Completion rate visualization would be displayed here</p>
              </div>
            </TabsContent>
            <TabsContent value="overdue" className="h-[300px]">
              {/* Overdue tasks chart would go here */}
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Overdue tasks visualization would be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
