'use client'

import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { createRoleSchema, editRoleSchema } from '@/lib/validations/role-schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type RoleFormValues = z.infer<typeof createRoleSchema> | z.infer<typeof editRoleSchema>

interface RoleFormProps {
  role?: any | null
  onSubmit: (values: RoleFormValues) => Promise<void>
  onSuccess?: (values: RoleFormValues) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}

export const RoleForm: FC<RoleFormProps> = ({ role, onSubmit, onSuccess, onError, onCancel }) => {
  const isEditing = !!role
  const formSchema = isEditing ? editRoleSchema : createRoleSchema

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
  })
  
  const { isSubmitting } = form.formState

  const handleFormSubmit = async (values: RoleFormValues) => {
    try {
      await onSubmit(values)
      onSuccess?.(values)
      if (!isEditing) {
        form.reset()
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Administrator, Editor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief description of the role" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Role')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
