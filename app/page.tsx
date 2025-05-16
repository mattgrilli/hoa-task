import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CommunitySelector } from "@/components/community-selector"
import { TaskMetrics } from "@/components/task-metrics"
import { RecentTasks } from "@/components/recent-tasks"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { DashboardCharts } from "@/components/dashboard-charts"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage tasks across your communities">
        <CommunitySelector />
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<TaskMetricsSkeleton />}>
          <TaskMetrics className="col-span-full md:col-span-2" />
        </Suspense>
        <Suspense fallback={<UpcomingDeadlinesSkeleton />}>
          <UpcomingDeadlines className="lg:col-span-1" />
        </Suspense>
      </div>
      <Suspense fallback={<DashboardChartsSkeleton />}>
        <DashboardCharts />
      </Suspense>
      <Suspense fallback={<RecentTasksSkeleton />}>
        <RecentTasks />
      </Suspense>
    </DashboardShell>
  )
}

function TaskMetricsSkeleton() {
  return <Skeleton className="col-span-full md:col-span-2 h-[300px]" />
}

function UpcomingDeadlinesSkeleton() {
  return <Skeleton className="lg:col-span-1 h-[300px]" />
}

function DashboardChartsSkeleton() {
  return <Skeleton className="w-full h-[400px]" />
}

function RecentTasksSkeleton() {
  return <Skeleton className="w-full h-[400px]" />
}
