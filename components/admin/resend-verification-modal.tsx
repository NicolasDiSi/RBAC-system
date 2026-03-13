'use client'

import { useState } from 'react'
import { toast } from 'sonner'
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
import { resendVerificationEmail } from '@/app/actions/admin' // Import the new action

interface ResendVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userEmail: string
}

export function ResendVerificationModal({ isOpen, onClose, userId, userEmail }: ResendVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await resendVerificationEmail(userId)
      toast.success(`Verification email sent to ${userEmail}!`)
      onClose()
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send verification email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resend Verification Email?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to resend the verification email to{' '}
            <span className="font-semibold">{userEmail}</span>?
            The user will receive a new email with a verification link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Resend Email'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
