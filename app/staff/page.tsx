import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { StaffList } from "@/components/staff-list"
import { StaffPerformance } from "@/components/staff-performance"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function StaffPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Staff Management" text="Manage community managers and assistants">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </DashboardHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <StaffList />
        <StaffPerformance />
      </div>
    </DashboardShell>
  )
}
