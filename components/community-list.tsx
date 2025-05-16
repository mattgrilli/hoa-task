"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { getCommunities } from "@/app/actions/communities"
import { getTasksByCommunity } from "@/app/actions/tasks"

export function CommunityList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [communityTasks, setCommunityTasks] = useState<Record<string, number>>({})

  useEffect(() => {
    async function loadCommunities() {
      try {
        const communitiesData = await getCommunities()
        setCommunities(communitiesData || [])

        // Load task counts for each community
        const taskCounts: Record<string, number> = {}
        for (const community of communitiesData) {
          const tasks = await getTasksByCommunity(community.id)
          taskCounts[community.id] = tasks.length
        }
        setCommunityTasks(taskCounts)

        setLoading(false)
      } catch (error) {
        console.error("Error loading communities:", error)
        setLoading(false)
      }
    }

    loadCommunities()
  }, [])

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communities</CardTitle>
        <CardDescription>Manage your HOA communities and their assignments.</CardDescription>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading communities...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Active Tasks</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {communities.length === 0
                      ? "No communities found. Add your first community to get started."
                      : "No communities match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommunities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">
                      <Link href={`/communities/${community.id}`} className="hover:underline">
                        {community.name}
                      </Link>
                    </TableCell>
                    <TableCell>{community.units}</TableCell>
                    <TableCell>
                      <Link href={`/tasks?community=${community.id}`} className="hover:underline">
                        {communityTasks[community.id] || 0} tasks
                      </Link>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/tasks?community=${community.id}`}>View Tasks</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Reports</DropdownMenuItem>
                          <DropdownMenuItem>Manage Staff</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
