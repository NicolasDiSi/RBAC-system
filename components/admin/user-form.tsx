'use client'

import { useEffect, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { createUserSchema, editUserSchema } from '@/lib/validations/user-schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type UserFormValues = z.infer<typeof createUserSchema> | z.infer<typeof editUserSchema>

interface UserFormProps {
  user?: any | null
  roles: any[]
  onSubmit: (values: UserFormValues) => Promise<void>
  onSuccess?: (values: UserFormValues) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}

export const UserForm: FC<UserFormProps> = ({ user, roles, onSubmit, onSuccess, onError, onCancel }) => {
  const isEditing = !!user
  const formSchema = isEditing ? editUserSchema : createUserSchema

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role_id: null,
      is_active: true,
    },
  })

  useEffect(() => {
    form.reset(
      user
        ? {
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.role_id,
            is_active: user.is_active,
          }
        : {
            name: '',
            email: '',
            password: '',
            role_id: undefined,
            is_active: true,
          }
    )
  }, [user, form])

  const { isSubmitting } = form.formState

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      await onSubmit(values)
      onSuccess?.(values)
      // Reset form only on successful creation
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@domain.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditing ? 'Leave blank to keep current password' : '********'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create User')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
