import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ReportGenerator } from "@/components/report-generator"
import { ReportList } from "@/components/report-list"

export default function ReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="Generate and view reports for communities and tasks" />
      <div className="grid gap-6 md:grid-cols-2">
        <ReportGenerator />
        <ReportList />
      </div>
    </DashboardShell>
  )
}
