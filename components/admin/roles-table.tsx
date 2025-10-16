"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield } from "lucide-react"
import { updateRolePermissions } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

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
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Select a role to manage its permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                  selectedRole === role.id ? "border-primary bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">{role.role_permissions[0]?.count || 0} permissions</Badge>
              </button>
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
            <PermissionsEditor roleId={selectedRole} groupedPermissions={groupedPermissions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PermissionsEditor({
  roleId,
  groupedPermissions,
}: {
  roleId: string
  groupedPermissions: Record<string, Permission[]>
}) {
  const router = useRouter()
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

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
    await updateRolePermissions(roleId, Array.from(selectedPermissions))
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([resource, perms]) => (
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
      ))}
      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Permissions"}
      </Button>
    </div>
  )
}
