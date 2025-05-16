import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CommunityList } from "@/components/community-list"
import { AddCommunityForm } from "@/components/add-community-form"

export default function CommunitiesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Communities" text="Manage your HOA communities">
        <AddCommunityForm />
      </DashboardHeader>
      <CommunityList />
    </DashboardShell>
  )
}
