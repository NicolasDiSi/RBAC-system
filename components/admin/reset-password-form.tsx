'use client'

import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { resetPasswordSchema } from '@/lib/validations/password-schemas'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  initialEmail: string
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>
  onSuccess?: () => void
  onError?: (error: Error) => void
  onCancel?: () => void
}

export const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ initialEmail, onSubmit, onSuccess, onError, onCancel }) => {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: initialEmail },
  })

  const { isSubmitting } = form.formState

  const handleFormSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await onSubmit(values)
      onSuccess?.()
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input placeholder="email@domain.com" {...field} readOnly /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (<Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>)}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
        </div>
      </form>
    </Form>
  )
}