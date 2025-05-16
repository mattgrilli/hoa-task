import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { TaskFilters } from "@/components/task-filters"
import { TaskList } from "@/components/task-list"
import { AddTaskForm } from "@/components/add-task-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function TasksPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Tasks" text="Manage and track tasks across all communities">
        <AddTaskForm />
      </DashboardHeader>
      <TaskFilters />
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList />
      </Suspense>
    </DashboardShell>
  )
}

function TaskListSkeleton() {
  return <Skeleton className="w-full h-[600px]" />
}
