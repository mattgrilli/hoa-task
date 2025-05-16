"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { TaskDetails } from "@/components/task-details"
import { TaskUpdates } from "@/components/task-updates"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { getTaskById } from "@/app/actions/tasks"
import { exportTaskToPdf } from "@/lib/pdf-export"
import { useToast } from "@/components/ui/use-toast"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadTask() {
      try {
        const taskData = await getTaskById(params.id)
        setTask(taskData)
        setLoading(false)
      } catch (error) {
        console.error(`Error loading task ${params.id}:`, error)
        setLoading(false)
      }
    }

    loadTask()
  }, [params.id])

  const handleExportPdf = async () => {
    if (!task) return

    setExporting(true)
    try {
      const result = await exportTaskToPdf(params.id, task.title)
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

  return (
    <DashboardShell>
      <DashboardHeader
        heading={loading ? "Loading..." : task ? task.title : "Task Not Found"}
        text={loading ? "Loading task details..." : task ? `Task ID: ${params.id.substring(0, 8)}` : "Task not found"}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
          <Button onClick={handleExportPdf} disabled={loading || !task || exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-6 md:grid-cols-3">
        <TaskDetails className="md:col-span-2" taskId={params.id} />
        <TaskUpdates className="md:col-span-1" taskId={params.id} />
      </div>
    </DashboardShell>
  )
}
