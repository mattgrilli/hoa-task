"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, MoreHorizontal, UserPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roles, setRoles] = useState<string[]>([
    "Admin",
    "Super Admin",
    "Community Manager",
    "Maintenance Staff",
    "Resident",
  ])
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    portfolio: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)

        // Fetch staff users
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

        // Fetch resident users
        const { data: residentData, error: residentError } = await supabase
          .from("residents")
          .select(`
            *,
            communities:community_id(
              id,
              name
            )
          `)
          .order("name")

        if (residentError) throw residentError

        // Transform staff data
        const transformedStaff = staffData.map((staff) => {
          const communities =
            staff.staff_communities?.map((sc: any) => ({
              id: sc.communities?.id,
              name: sc.communities?.name,
            })) || []

          return {
            ...staff,
            userType: "staff",
            communities,
            portfolioName: communities.length > 0 ? `${communities.length} communities` : "No portfolio",
          }
        })

        // Transform resident data
        const transformedResidents = residentData.map((resident) => {
          return {
            ...resident,
            userType: "resident",
            role: "Resident",
            communities: resident.communities ? [resident.communities] : [],
            portfolioName: resident.communities?.name || "No community",
          }
        })

        // Combine and set users
        setUsers([...transformedStaff, ...transformedResidents])

        // Fetch portfolios (communities for now, but could be expanded)
        const { data: portfolioData, error: portfolioError } = await supabase
          .from("communities")
          .select("*")
          .order("name")

        if (portfolioError) throw portfolioError

        setPortfolios(portfolioData || [])
      } catch (error: any) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error fetching users",
          description: error.message || "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.name || !newUser.email || !newUser.role) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Create auth user (in a real app, this would send an invite email)
      // For demo purposes, we'll just create the user record

      if (newUser.role === "Resident") {
        // Create resident
        const { data, error } = await supabase
          .from("residents")
          .insert([
            {
              name: newUser.name,
              email: newUser.email,
              community_id: newUser.portfolio || null,
              unit_number: "TBD",
            },
          ])
          .select()

        if (error) throw error

        toast({
          title: "Resident created",
          description: `${newUser.name} has been added as a resident`,
        })
      } else {
        // Create staff
        const { data, error } = await supabase
          .from("staff")
          .insert([
            {
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
            },
          ])
          .select()

        if (error) throw error

        // If portfolio selected, assign to community
        if (newUser.portfolio && data?.[0]?.id) {
          const { error: assignError } = await supabase.from("staff_communities").insert([
            {
              staff_id: data[0].id,
              community_id: newUser.portfolio,
            },
          ])

          if (assignError) throw assignError
        }

        toast({
          title: "Staff member created",
          description: `${newUser.name} has been added as ${newUser.role}`,
        })
      }

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        role: "",
        portfolio: "",
      })
      setIsAddUserOpen(false)

      // Refresh user list
      const { data: staffData } = await supabase
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

      const { data: residentData } = await supabase
        .from("residents")
        .select(`
          *,
          communities:community_id(
            id,
            name
          )
        `)
        .order("name")

      // Transform and set users
      const transformedStaff =
        staffData?.map((staff) => {
          const communities =
            staff.staff_communities?.map((sc: any) => ({
              id: sc.communities?.id,
              name: sc.communities?.name,
            })) || []

          return {
            ...staff,
            userType: "staff",
            communities,
            portfolioName: communities.length > 0 ? `${communities.length} communities` : "No portfolio",
          }
        }) || []

      const transformedResidents =
        residentData?.map((resident) => {
          return {
            ...resident,
            userType: "resident",
            role: "Resident",
            communities: resident.communities ? [resident.communities] : [],
            portfolioName: resident.communities?.name || "No community",
          }
        }) || []

      setUsers([...transformedStaff, ...transformedResidents])
    } catch (error: any) {
      console.error("Error adding user:", error)
      toast({
        title: "Error adding user",
        description: error.message || "Failed to add user",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account and assign roles and permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portfolio" className="text-right">
                  {newUser.role === "Resident" ? "Community" : "Portfolio"}
                </Label>
                <Select
                  value={newUser.portfolio}
                  onValueChange={(value) => setNewUser({ ...newUser, portfolio: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={`Select ${newUser.role === "Resident" ? "community" : "portfolio"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading users...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Portfolio/Community</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {users.length === 0
                    ? "No users found. Add your first user to get started."
                    : "No users match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={`${user.userType}-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || "/abstract-geometric-shapes.png"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.userType === "staff" ? "outline" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.communities && user.communities.length > 0 ? (
                        user.userType === "staff" && user.communities.length > 1 ? (
                          <Badge variant="outline">{user.portfolioName}</Badge>
                        ) : (
                          user.communities.map((community: any, index: number) => (
                            <Badge key={index} variant="secondary">
                              {community.name}
                            </Badge>
                          ))
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">No portfolio assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
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
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>Manage Portfolios</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
