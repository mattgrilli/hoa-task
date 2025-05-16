"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function RoleManagement() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Admin",
      description: "Full system access and control",
      permissions: {
        users: ["view", "create", "edit", "delete"],
        communities: ["view", "create", "edit", "delete"],
        tasks: ["view", "create", "edit", "delete"],
        reports: ["view", "create", "export"],
        settings: ["view", "edit"],
      },
      userCount: 2,
    },
    {
      id: 2,
      name: "Super Admin",
      description: "Extended administrative privileges",
      permissions: {
        users: ["view", "create", "edit", "delete"],
        communities: ["view", "create", "edit", "delete"],
        tasks: ["view", "create", "edit", "delete"],
        reports: ["view", "create", "export"],
        settings: ["view", "edit"],
      },
      userCount: 1,
    },
    {
      id: 3,
      name: "Community Manager",
      description: "Manages assigned communities and tasks",
      permissions: {
        users: ["view"],
        communities: ["view", "edit"],
        tasks: ["view", "create", "edit", "delete"],
        reports: ["view", "create"],
        settings: ["view"],
      },
      userCount: 8,
    },
    {
      id: 4,
      name: "Maintenance Staff",
      description: "Handles maintenance tasks and requests",
      permissions: {
        users: [],
        communities: ["view"],
        tasks: ["view", "edit"],
        reports: ["view"],
        settings: [],
      },
      userCount: 12,
    },
    {
      id: 5,
      name: "Resident",
      description: "Community resident with limited access",
      permissions: {
        users: [],
        communities: ["view"],
        tasks: ["view"],
        reports: [],
        settings: [],
      },
      userCount: 156,
    },
  ])

  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: {
      users: [] as string[],
      communities: [] as string[],
      tasks: [] as string[],
      reports: [] as string[],
      settings: [] as string[],
    },
  })

  const { toast } = useToast()

  const permissionCategories = [
    {
      name: "users",
      label: "Users",
      permissions: ["view", "create", "edit", "delete"],
    },
    {
      name: "communities",
      label: "Communities",
      permissions: ["view", "create", "edit", "delete"],
    },
    {
      name: "tasks",
      label: "Tasks",
      permissions: ["view", "create", "edit", "delete"],
    },
    {
      name: "reports",
      label: "Reports",
      permissions: ["view", "create", "export"],
    },
    {
      name: "settings",
      label: "Settings",
      permissions: ["view", "edit"],
    },
  ]

  const handleAddRole = () => {
    if (!newRole.name) {
      toast({
        title: "Missing information",
        description: "Please provide a role name",
        variant: "destructive",
      })
      return
    }

    setRoles([
      ...roles,
      {
        id: roles.length + 1,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        userCount: 0,
      },
    ])

    setNewRole({
      name: "",
      description: "",
      permissions: {
        users: [],
        communities: [],
        tasks: [],
        reports: [],
        settings: [],
      },
    })

    setIsAddRoleOpen(false)

    toast({
      title: "Role created",
      description: `${newRole.name} role has been created successfully`,
    })
  }

  const togglePermission = (category: string, permission: string) => {
    setNewRole((prev) => {
      const currentPermissions = prev.permissions[category as keyof typeof prev.permissions] as string[]
      let updatedPermissions: string[]

      if (currentPermissions.includes(permission)) {
        updatedPermissions = currentPermissions.filter((p) => p !== permission)
      } else {
        updatedPermissions = [...currentPermissions, permission]
      }

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [category]: updatedPermissions,
        },
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role with specific permissions</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-name" className="text-right">
                  Role Name
                </Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-medium mb-4">Permissions</h4>
                <div className="space-y-6">
                  {permissionCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <h5 className="text-sm font-medium">{category.label}</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {category.permissions.map((permission) => (
                          <div key={`${category.name}-${permission}`} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${category.name}-${permission}`}
                              checked={newRole.permissions[category.name as keyof typeof newRole.permissions].includes(
                                permission,
                              )}
                              onCheckedChange={() => togglePermission(category.name, permission)}
                            />
                            <Label htmlFor={`${category.name}-${permission}`} className="capitalize">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Users</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>{role.userCount}</TableCell>
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
                    <DropdownMenuItem>Edit Role</DropdownMenuItem>
                    <DropdownMenuItem>View Permissions</DropdownMenuItem>
                    <DropdownMenuItem>View Users</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete Role</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
