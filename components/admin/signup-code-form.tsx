'use client'

import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { createSignupCode } from '@/app/actions/signupCode'

const formSchema = z.object({
  userId: z.string().min(1, { message: 'Please select a user.' }),
  expirationDuration: z.string().transform(Number).pipe(z.number().min(1, { message: 'Duration must be at least 1 minute.' })),
})

interface SignupCodeFormProps {
  users: { id: string; name: string; email: string }[]
  onSuccess?: () => void
  onCancel?: () => void
}

export const SignupCodeForm: FC<SignupCodeFormProps> = ({ users, onSuccess, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      expirationDuration: 60, // Default to 60 minutes
    },
  })

  const { isSubmitting } = form.formState

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createSignupCode(values.userId, values.expirationDuration)
      onSuccess?.()
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associate with User</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
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
          name="expirationDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 60" {...field} />
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
            {isSubmitting ? 'Generating...' : 'Generate Code'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
