import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { TaskFilters } from "@/components/task-filters"
import { TaskList } from "@/components/task-list"
import { AddTaskForm } from "@/components/add-task-form"

export default function TasksPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Tasks" text="Manage and track tasks across all communities">
        <AddTaskForm />
      </DashboardHeader>
      <TaskFilters />
      <TaskList />
    </DashboardShell>
  )
}
