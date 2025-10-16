"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserStatus, updateUserRole } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  is_active: boolean
  role_id: string | null
  role: { id: string; name: string } | null
  created_at: string
}

interface Role {
  id: string
  name: string
}

export function UsersTable({ users, roles }: { users: User[]; roles: Role[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setLoading(userId)
    await updateUserStatus(userId, !currentStatus)
    setLoading(null)
    router.refresh()
  }

  const handleRoleChange = async (userId: string, roleId: string) => {
    setLoading(userId)
    await updateUserRole(userId, roleId)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                {user.is_active ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role_id || "none"}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                  disabled={loading === user.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant={user.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleStatusToggle(user.id, user.is_active)}
                  disabled={loading === user.id}
                >
                  {user.is_active ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
