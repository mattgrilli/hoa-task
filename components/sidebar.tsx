"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, Home, Users, FileText } from "lucide-react"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/tasks",
      label: "Tasks",
      icon: ClipboardList,
    },
    {
      href: "/communities",
      label: "Communities",
      icon: Home,
    },
    {
      href: "/staff",
      label: "Staff",
      icon: Users,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: FileText,
    },
  ]

  return (
    <ShadcnSidebar className={cn("flex-shrink-0", className)}>
      <SidebarHeader className="pb-0">
        <div className="flex items-center justify-center px-2 py-3">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.label}>
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <div className="px-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} HOA Task Manager</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  )
}
