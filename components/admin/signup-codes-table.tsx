'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SignupCodeForm } from './signup-code-form'
import { deleteSignupCode } from '@/app/actions/signupCode'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { Role } from '@/lib/data/types/database'

interface SignupCode {
  id: string
  code: string
  role_id: string | null
  used_by_user_id: string | null
  expires_at: string
  is_used: boolean
  used_at: string | null
  created_at: string
}

interface User {
  id: string
  name: string
  email: string
}

interface Permissions {
  canGenerate: boolean
  canDelete: boolean
}

export function SignupCodesTable({ signupCodes = [], users = [], roles = [], permissions }: { signupCodes: SignupCode[]; users: User[]; roles: Role[]; permissions: Permissions }) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState<SignupCode | null>(null)

  const fetchSignupCodes = useCallback(() => {
    router.refresh()
  }, [router])

  const handleGenerateSuccess = () => {
    toast.success('Signup code generated successfully!')
    setIsFormOpen(false)
    fetchSignupCodes()
  }

  const handleDeleteClick = (code: SignupCode) => {
    setCodeToDelete(code)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCode = async () => {
    if (!codeToDelete) return
    try {
      await deleteSignupCode(codeToDelete.id)
      toast.success('Signup code deleted successfully!')
      fetchSignupCodes()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete signup code.')
    } finally {
      setIsDeleteDialogOpen(false)
      setCodeToDelete(null)
    }
  }

  const getAssignedRoleName = (roleId: string | null) => {
    if (!roleId) return 'N/A'
    const role = roles.find(r => r.id === roleId)
    return role ? role.name : 'Unknown Role'
  }

  const getUsedByUserName = (userId: string | null) => {
    if (!userId) return 'N/A'
    const user = users.find(u => u.id === userId)
    return user ? `${user.name} (${user.email})` : 'Unknown User'
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        {permissions.canGenerate && (
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Code
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Assigned Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Used By</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signupCodes.map((code) => (
            <TableRow key={code.id}>
              <TableCell className="font-mono">{code.code}</TableCell>
              <TableCell>{getAssignedRoleName(code.role_id)}</TableCell>
              <TableCell>
                <Badge variant={code.is_used ? 'secondary' : (new Date(code.expires_at) < new Date() ? 'destructive' : 'default')}>
                  {code.is_used ? `Used` : (new Date(code.expires_at) < new Date() ? 'Expired' : 'Active')}
                </Badge>
              </TableCell>
              <TableCell>{getUsedByUserName(code.used_by_user_id)}</TableCell>
              <TableCell>{code.expiresAt === null ? 'N/A' : format(new Date(code.expiresAt), 'PPP p')}</TableCell>
              <TableCell>{code.expiresAt === null ? 'N/A' : format(new Date(code.createdAt), 'PPP p')}</TableCell>
              <TableCell>
                {permissions.canDelete && !code.is_used && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(code)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Signup Code</DialogTitle>
          </DialogHeader>
          <SignupCodeForm
            roles={roles}
            onSuccess={handleGenerateSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the signup code &quot;{codeToDelete?.code}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCode}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
