"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function PortfolioManagement() {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false)
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
    manager: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch communities
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select(`
            *,
            staff_communities(
              staff:staff_id(
                id,
                name,
                role
              )
            ),
            tasks(id)
          `)
          .order("name")

        if (communityError) throw communityError

        // Transform community data into portfolios
        const transformedCommunities = communityData.map((community) => {
          const managers = community.staff_communities
            .filter((sc: any) => sc.staff?.role === "Community Manager" || sc.staff?.role === "Admin")
            .map((sc: any) => sc.staff)

          return {
            id: community.id,
            name: community.name,
            description:
              `${community.address || ""} ${community.city || ""}, ${community.state || ""} ${community.zip || ""}`.trim(),
            type: "Community",
            units: community.units,
            taskCount: community.tasks.length,
            managers,
          }
        })

        setPortfolios(transformedCommunities)
        setCommunities(communityData)

        // Fetch staff members
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .in("role", ["Community Manager", "Admin", "Super Admin"])
          .order("name")

        if (staffError) throw staffError

        setStaffMembers(staffData || [])
      } catch (error: any) {
        console.error("Error fetching portfolios:", error)
        toast({
          title: "Error fetching portfolios",
          description: error.message || "Failed to load portfolios",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const filteredPortfolios = portfolios.filter(
    (portfolio) =>
      portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddPortfolio = async () => {
    try {
      // Validate form
      if (!newPortfolio.name) {
        toast({
          title: "Missing information",
          description: "Please provide a portfolio name",
          variant: "destructive",
        })
        return
      }

      // Create community (portfolio)
      const { data, error } = await supabase
        .from("communities")
        .insert([
          {
            name: newPortfolio.name,
            address: newPortfolio.description,
            units: 0,
          },
        ])
        .select()

      if (error) throw error

      // If manager selected, assign to community
      if (newPortfolio.manager && data?.[0]?.id) {
        const { error: assignError } = await supabase.from("staff_communities").insert([
          {
            staff_id: newPortfolio.manager,
            community_id: data[0].id,
          },
        ])

        if (assignError) throw assignError
      }

      toast({
        title: "Portfolio created",
        description: `${newPortfolio.name} has been created successfully`,
      })

      // Reset form and close dialog
      setNewPortfolio({
        name: "",
        description: "",
        manager: "",
      })
      setIsAddPortfolioOpen(false)

      // Refresh portfolios
      const { data: communityData } = await supabase
        .from("communities")
        .select(`
          *,
          staff_communities(
            staff:staff_id(
              id,
              name,
              role
            )
          ),
          tasks(id)
        `)
        .order("name")

      // Transform community data into portfolios
      const transformedCommunities =
        communityData?.map((community) => {
          const managers = community.staff_communities
            .filter((sc: any) => sc.staff?.role === "Community Manager" || sc.staff?.role === "Admin")
            .map((sc: any) => sc.staff)

          return {
            id: community.id,
            name: community.name,
            description:
              `${community.address || ""} ${community.city || ""}, ${community.state || ""} ${community.zip || ""}`.trim(),
            type: "Community",
            units: community.units,
            taskCount: community.tasks.length,
            managers,
          }
        }) || []

      setPortfolios(transformedCommunities)
    } catch (error: any) {
      console.error("Error adding portfolio:", error)
      toast({
        title: "Error adding portfolio",
        description: error.message || "Failed to add portfolio",
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
            placeholder="Search portfolios..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddPortfolioOpen} onOpenChange={setIsAddPortfolioOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Portfolio</DialogTitle>
              <DialogDescription>Add a new portfolio or community group</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portfolio-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="portfolio-name"
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portfolio-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="portfolio-description"
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portfolio-manager" className="text-right">
                  Manager
                </Label>
                <Select
                  value={newPortfolio.manager}
                  onValueChange={(value) => setNewPortfolio({ ...newPortfolio, manager: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPortfolioOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPortfolio}>Create Portfolio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading portfolios...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Properties/Units</TableHead>
              <TableHead>Managers</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPortfolios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {portfolios.length === 0
                    ? "No portfolios found. Add your first portfolio to get started."
                    : "No portfolios match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPortfolios.map((portfolio) => (
                <TableRow key={portfolio.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{portfolio.name}</p>
                      <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{portfolio.type}</Badge>
                  </TableCell>
                  <TableCell>{portfolio.units} units</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {portfolio.managers && portfolio.managers.length > 0 ? (
                        portfolio.managers.map((manager: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {manager.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No manager assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={`/tasks?communityId=${portfolio.id}`} className="hover:underline">
                      {portfolio.taskCount} tasks
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Portfolio</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Manage Staff</DropdownMenuItem>
                        <DropdownMenuItem>View Tasks</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Portfolio</DropdownMenuItem>
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
