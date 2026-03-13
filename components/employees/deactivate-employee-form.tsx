'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { deactivateEmployee } from '@/app/actions/employees'
import { deactivateEmployeeSchema, DeactivateEmployeeFormValues } from '@/lib/validations/deactivation-schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type InferSelectModel } from 'drizzle-orm'
import { empleados } from '@/lib/db/schema'

type Employee = InferSelectModel<typeof empleados>;
interface DeactivateEmployeeFormProps {
  employee: Employee
  onSuccess: () => void
  onError: (error: Error) => void
  onCancel: () => void
}

export function DeactivateEmployeeForm({
  employee,
  onSuccess,
  onError,
  onCancel,
}: DeactivateEmployeeFormProps) {
  const form = useForm<DeactivateEmployeeFormValues>({
    resolver: zodResolver(deactivateEmployeeSchema),
    defaultValues: {
      fechaEgreso: new Date().toISOString().split('T')[0],
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: DeactivateEmployeeFormValues) => {
    try {
      const result = await deactivateEmployee(employee.id, values)
      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fechaEgreso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Deactivating..." : "Deactivate"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
