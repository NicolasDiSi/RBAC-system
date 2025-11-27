"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react" // Added MoreHorizontal, PlusCircle, Edit, Trash2
import { updateRolePermissions, createRole, updateRole, deleteRole } from "@/app/actions/admin" // Added createRole, updateRole, deleteRole
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu' // Added DropdownMenu imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog' // Added Dialog imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog' // Added AlertDialog imports
import { RoleForm } from "./role-form" // Added RoleForm import
import { toast } from "sonner" // Added toast import

interface Role {
  id: string
  name: string
  description: string | null
  role_permissions: { count: number }[]
}

interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
}

export function RolesTable({ roles, permissions }: { roles: Role[]; permissions: Permission[] }) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const fetchRoles = useCallback(() => {
    router.refresh()
  }, [router])

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  const openRoleForm = (role: Role | null) => {
    setEditingRole(role)
    setIsRoleFormOpen(true)
  }

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const handleRoleFormSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values)
        toast.success('Role updated successfully!')
      } else {
        await createRole(values)
        toast.success('Role created successfully!')
      }
      setIsRoleFormOpen(false)
      fetchRoles()
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.')
    }
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return
    try {
      await deleteRole(roleToDelete.id)
      toast.success('Role deleted successfully!')
      fetchRoles()
      if (selectedRole === roleToDelete.id) {
        setSelectedRole(null) // Deselect if the deleted role was selected
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete role.')
    } finally {
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Roles</CardTitle>
          <Button size="sm" onClick={() => openRoleForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">Select a role to manage its permissions</CardDescription>
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`w-full flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                  selectedRole === role.id ? "border-primary bg-muted" : ""
                }`}
              >
                <button
                  onClick={() => setSelectedRole(role.id)}
                  className="flex flex-1 items-center gap-3 focus:outline-none"
                >
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{role.role_permissions[0]?.count || 0} permissions</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openRoleForm(role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(role)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Manage permissions for {roles.find((r) => r.id === selectedRole)?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionsEditor roleId={selectedRole} groupedPermissions={groupedPermissions} fetchRoles={fetchRoles} />
          </CardContent>
        </Card>
      )}

      <Dialog open={isRoleFormOpen} onOpenChange={setIsRoleFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          </DialogHeader>
          <RoleForm
            role={editingRole}
            onSubmit={handleRoleFormSubmit}
            onCancel={() => setIsRoleFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role &quot;{roleToDelete?.name}&quot;
              and remove it from all associated users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function PermissionsEditor({
  roleId,
  groupedPermissions,
  fetchRoles, // Added fetchRoles prop
}: {
  roleId: string
  groupedPermissions: Record<string, Permission[]>
  fetchRoles: () => void // Added fetchRoles prop type
}) {
  const router = useRouter()
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Fetch current role permissions when roleId changes
  // This is crucial to pre-select checkboxes based on the role's current permissions
  const fetchRolePermissions = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/roles/${roleId}/permissions`); // Assuming this API exists
    if (response.ok) {
      const data = await response.json();
      setSelectedPermissions(new Set(data.permissionIds));
    } else {
      toast.error('Failed to fetch role permissions.');
    }
    setLoading(false);
  }, [roleId]);

  useEffect(() => {
    fetchRolePermissions();
  }, [fetchRolePermissions]);

  const handleToggle = (permissionId: string) => {
    const newSet = new Set(selectedPermissions)
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId)
    } else {
      newSet.add(permissionId)
    }
    setSelectedPermissions(newSet)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateRolePermissions(roleId, Array.from(selectedPermissions))
      toast.success('Permissions updated successfully!')
      fetchRoles() // Refresh roles to update permission counts
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div>Loading permissions...</div>
      ) : (
        Object.entries(groupedPermissions).map(([resource, perms]) => (
          <div key={resource} className="space-y-3">
            <h4 className="font-medium capitalize">{resource.replace("_", " ")}</h4>
            <div className="space-y-2">
              {perms.map((permission) => (
                <div key={permission.id} className="flex items-center gap-3">
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.has(permission.id)}
                    onCheckedChange={() => handleToggle(permission.id)}
                  />
                  <label htmlFor={permission.id} className="flex-1 cursor-pointer text-sm">
                    <span className="font-medium">{permission.action}</span>
                    {permission.description && <span className="text-muted-foreground"> - {permission.description}</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Permissions"}
      </Button>
    </div>
  )
}
