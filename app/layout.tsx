import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"
import { EnvironmentCheck } from "@/components/env-check"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HOA Task Manager",
  description: "Task management for HOA management companies",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <div className="flex min-h-screen flex-col w-full">
              <SiteHeader />
              <div className="flex flex-1 w-full pt-16">
                {" "}
                {/* Added pt-16 to account for header height */}
                <Sidebar className="hidden md:block fixed top-16 left-0 h-[calc(100vh-4rem)]" />{" "}
                {/* Fixed position with top offset */}
                <main className="flex-1 w-full md:ml-[16rem]">
                  {" "}
                  {/* Add margin to prevent content from being hidden under sidebar */}
                  <EnvironmentCheck />
                  <div className="container py-6 w-full max-w-full">{children}</div>
                </main>
              </div>
              <SiteFooter />
            </div>
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
