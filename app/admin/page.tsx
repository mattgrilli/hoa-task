import { StaffApprovalManager } from "@/components/staff-approval-manager"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your HOA system settings and users</p>
      </div>

      <StaffApprovalManager />

      {/* Other admin components will go here */}
    </div>
  )
}
