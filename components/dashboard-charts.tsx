"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTasks } from "@/app/actions/tasks"
import { getStaff } from "@/app/actions/staff"
import { getCommunities } from "@/app/actions/communities"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function DashboardCharts() {
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<any[]>([])
  const [priorityData, setPriorityData] = useState<any[]>([])
  const [communityData, setCommunityData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [allTasks, communities, staff] = await Promise.all([getTasks(), getCommunities(), getStaff()])

        // Status data for pie chart
        const statusCounts: Record<string, number> = {}
        allTasks.forEach((task) => {
          const status = task.status.toLowerCase()
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        setStatusData(
          Object.entries(statusCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          })),
        )

        // Priority data for bar chart
        const priorityCounts: Record<string, number> = {}
        allTasks.forEach((task) => {
          const priority = task.priority.toLowerCase()
          priorityCounts[priority] = (priorityCounts[priority] || 0) + 1
        })

        setPriorityData(
          Object.entries(priorityCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          })),
        )

        // Community data for bar chart
        const communityCounts: Record<string, number> = {}
        allTasks.forEach((task) => {
          const community = task.community
          communityCounts[community] = (communityCounts[community] || 0) + 1
        })

        setCommunityData(
          Object.entries(communityCounts)
            .map(([name, value]) => ({
              name,
              value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5), // Top 5 communities
        )

        // Trend data for line chart (mock data based on creation dates)
        const now = new Date()
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Create data for the last 6 months
        const trendData = []
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthName = monthNames[month.getMonth()]

          // Count tasks created in this month
          const tasksCreated = allTasks.filter((task) => {
            const createdDate = new Date(task.createdAt)
            return createdDate.getMonth() === month.getMonth() && createdDate.getFullYear() === month.getFullYear()
          }).length

          // Count tasks completed in this month (using mock data)
          const tasksCompleted = Math.floor(tasksCreated * (0.6 + Math.random() * 0.3))

          trendData.push({
            name: monthName,
            created: tasksCreated,
            completed: tasksCompleted,
          })
        }

        setTrendData(trendData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading chart data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
  const PRIORITY_COLORS = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981",
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p>Loading chart data...</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Task Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p>Loading chart data...</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Tasks by Community</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p>Loading chart data...</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Task Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p>Loading chart data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Task Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Task Priority</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
              <Bar dataKey="value" barSize={30}>
                {priorityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>Tasks by Community</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={communityData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
              <Bar dataKey="value" fill="#8884d8" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Task Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#8884d8" activeDot={{ r: 8 }} name="Tasks Created" />
              <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Tasks Completed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
