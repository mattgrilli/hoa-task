"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function StaffList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [staffTasks, setStaffTasks] = useState<Record<string, number>>({})
  const { toast } = useToast()

  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true)

        // Fetch staff with their communities
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select(`
            *,
            staff_communities(
              community_id,
              communities:community_id(
                id,
                name
              )
            )
          `)
          .order("name")

        if (staffError) throw staffError

        // Transform the data to match the expected format
        const transformedData =
          staffData?.map((staff) => {
            const communities =
              staff.staff_communities?.map((sc: any) => ({
                id: sc.communities?.id,
                name: sc.communities?.name,
              })) || []

            return {
              ...staff,
              communities,
            }
          }) || []

        setStaffMembers(transformedData)

        // Load task counts for each staff member
        const taskCounts: Record<string, number> = {}

        for (const staff of transformedData) {
          const { count, error: countError } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("assigned_to", staff.id)

          if (countError) {
            console.error(`Error counting tasks for staff ${staff.id}:`, countError)
            continue
          }

          taskCounts[staff.id] = count || 0
        }

        setStaffTasks(taskCounts)
      } catch (error: any) {
        console.error("Error loading staff:", error)
        toast({
          title: "Error loading staff",
          description: error.message || "Failed to load staff members",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStaff()
  }, [toast])

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>Manage community managers and assistants.</CardDescription>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading staff members...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Communities</TableHead>
                <TableHead>Active Tasks</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {staffMembers.length === 0
                      ? "No staff members found. Add your first staff member to get started."
                      : "No staff members match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={staff.avatar_url || "/abstract-geometric-shapes.png"} alt={staff.name} />
                          <AvatarFallback>
                            {staff.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{staff.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staff.communities && staff.communities.length > 0 ? (
                          staff.communities.map((community: any, index: number) => (
                            <Badge key={index} variant="secondary">
                              {community.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No communities assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={`/tasks?assignedTo=${staff.id}`} className="hover:underline">
                        {staffTasks[staff.id] || 0} tasks
                      </a>
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Tasks</DropdownMenuItem>
                          <DropdownMenuItem>View Performance</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Manage Communities</DropdownMenuItem>
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
