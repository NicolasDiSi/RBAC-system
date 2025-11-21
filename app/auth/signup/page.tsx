'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { Separator } from '@/components/ui/separator'
import { InputPassword } from '@/components/ui/password-input'
// import { getUserById } from '@/lib/data/user' // REMOVED
import { User } from '@/lib/data/types/database'
import { updateUserPassword } from '@/app/actions/user'

const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
})

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    if (!userId) {
      router.replace('/auth/enter-code')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`); // Fetch from new API route
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user data.');
        }
        const userData: User = await response.json();
        setUser(userData);
      } catch (error: any) {
        toast.error(error.message || 'Invalid user ID or user not found.');
        router.replace('/auth/enter-code');
      } finally {
        setIsLoadingUser(false);
      }
    }
    fetchUser()
  }, [userId, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast.error('User ID is missing. Please re-enter your signup code.')
      router.replace('/auth/enter-code')
      return
    }
    try {
      await updateUserPassword(userId, values.password)
      toast.success('Registration successful! Please wait for an admin to activate your account.')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.')
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Fetching user details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please wait while we load your registration details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null // Should redirect by now
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Complete Your Account</CardTitle>
          <CardDescription>Set your password or continue with Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name" // This field is not part of formSchema, but used for display
                render={() => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input value={user.name || ''} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email" // This field is not part of formSchema, but used for display
                render={() => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={user.email || ''} readOnly />
                    </FormControl>
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
                      <InputPassword {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Setting Password...' : 'Set Password'}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton userId={userId} />

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/auth/login" className="underline underline-offset-4 hover:text-primary">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
