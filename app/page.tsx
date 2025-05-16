import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CommunitySelector } from "@/components/community-selector"
import { TaskMetrics } from "@/components/task-metrics"
import { RecentTasks } from "@/components/recent-tasks"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { DashboardCharts } from "@/components/dashboard-charts"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage tasks across your communities">
        <CommunitySelector />
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TaskMetrics className="col-span-full md:col-span-2" />
        <UpcomingDeadlines className="lg:col-span-1" />
      </div>
      <DashboardCharts />
      <RecentTasks />
    </DashboardShell>
  )
}
