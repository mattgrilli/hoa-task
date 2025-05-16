import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  // Check if user has admin role
  const role = await getUserRole()

  if (role !== "Admin" && role !== "Super Admin") {
    redirect("/")
  }

  return <AdminDashboard />
}
