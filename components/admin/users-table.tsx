'use client'
 
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { MoreHorizontal, Key, Share2, UserPlus, Edit, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { createUser, updateUser, updateUserPassword, resetPasswordForEmail } from '@/app/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { ShareCredentialsModal } from './share-credentials-modal'
import { UserForm } from './user-form'
import { ChangePasswordForm } from './change-password-form'
import { ResetPasswordForm } from './reset-password-form'

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

export function UsersTable({ users, roles }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    // In a real app, you'd likely call a server action or API route
    // that revalidates the path, but for now we'll just refresh the page.
    window.location.reload()
  }, [])

  const handleFormSubmit = async (values) => {
    const isEditing = !!editingUser
    const action = isEditing ? updateUser.bind(null, editingUser.id) : createUser
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'password' && !value) return
      // Append empty string for null/undefined, otherwise convert to string
      formData.append(key, value === null || value === undefined ? '' : String(value))
    })
    await action(formData)
  }

  const handleChangePasswordSubmit = async (values) => {
    if (!selectedUser) return
    const formData = new FormData()
    formData.append('password', values.password)
    formData.append('sign_out_user', String(values.sign_out_user))
    await updateUserPassword(selectedUser.id, formData)
  }

  const handleResetPasswordSubmit = async (values) => {
    await resetPasswordForEmail(values.email)
  }

  const openUserForm = (user: User | null) => {
    setEditingUser(user)
    setIsUserFormOpen(true)
  }

  const openDialog = (user: User, dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setSelectedUser(user)
    dialogSetter(true)
  }

  const openShareModal = (user: User) => {
    setSelectedUser(user)
    setIsShareModalOpen(true)
  }

  const closeShareModal = () => {
    setSelectedUser(null)
    setIsShareModalOpen(false)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => openUserForm(null)}>
          <UserPlus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role?.name || 'No Role'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.is_active ? 'default' : 'outline'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openUserForm(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openShareModal(user)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDialog(user, setIsResetPasswordDialogOpen)}>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Reset Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openDialog(user, setIsChangePasswordDialogOpen)}>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
            roles={roles}
            onSubmit={handleFormSubmit}
            onSuccess={() => {
              toast.success(editingUser ? 'User updated successfully!' : 'User created successfully!')
              setIsUserFormOpen(false)
              fetchUsers()
            }}
            onError={(error) => toast.error(error.message || 'An unexpected error occurred.')}
            onCancel={() => setIsUserFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              The user will not be notified of this change.
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm
            onSubmit={handleChangePasswordSubmit}
            onSuccess={() => {
              toast.success('Password updated successfully!')
              setIsChangePasswordDialogOpen(false)
            }}
            onError={(error) => toast.error(error.message || 'An unexpected error occurred.')}
            onCancel={() => setIsChangePasswordDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              This will send a password reset link to the user's email address.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && <ResetPasswordForm
            initialEmail={selectedUser.email}
            onSubmit={handleResetPasswordSubmit}
            onSuccess={() => {
              toast.success('Password reset link sent successfully!')
              setIsResetPasswordDialogOpen(false)
            }}
            onError={(error) => toast.error(error.message || 'An unexpected error occurred.')}
            onCancel={() => setIsResetPasswordDialogOpen(false)}
          />}
        </DialogContent>
      </Dialog>
      {selectedUser && (
        <ShareCredentialsModal
          isOpen={isShareModalOpen}
          onClose={closeShareModal}
          userId={selectedUser.id}
        />
      )}
    </>
  )
}
