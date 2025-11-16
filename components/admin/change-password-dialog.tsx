
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ChangePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function ChangePasswordDialog({ isOpen, onClose, userId }: ChangePasswordDialogProps) {
  if (!isOpen) return null

  // TODO: Implement the form with password and retype-password fields
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <p>Change password form will be here for user ID: {userId}</p>
      </DialogContent>
    </Dialog>
  )
}
