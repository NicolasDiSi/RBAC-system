'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp' // Assuming this component exists
import { Separator } from '@/components/ui/separator'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'


const formSchema = z.object({
  code: z.string().min(6, { message: 'Code must be 6 digits.' }).max(6, { message: 'Code must be 6 digits.' }),
})

export default function EnterCodePage() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await fetch('/api/auth/verify-signup-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: values.code }),
    })

    if (response.ok) {
      const data = await response.json()
      toast.success('Code verified successfully! You can now complete your registration.')
      router.push(`/auth/signup?userId=${data.userId}`)
    } else {
      const data = await response.json()
      toast.error(data.message || 'An unexpected error occurred.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Enter Signup Code</CardTitle>
          <CardDescription>Please enter the 6-digit code provided by your administrator.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signup Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying Code...' : 'Verify Code'}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or if you already have an account
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <a href="/auth/login" className="underline underline-offset-4 hover:text-primary">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
