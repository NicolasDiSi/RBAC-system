'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ShareTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { token } = await params
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyTokenAndLogin = async () => {
      if (!token) {
        setError('Share token is missing.')
        setLoading(false)
        router.replace('/unauthorized')
        return
      }

      try {
        const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await fetch('/api/auth/verify-share-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, clientTimezone }),
        })

        if (response.ok) {
          const data = await response.json()
          toast.success(data.message || 'Logged in successfully!')
          router.replace(data.redirect || '/dashboard')
        } else {
          const data = await response.json()
          setError(data.message || 'Failed to log in with share link.')
          toast.error(data.message || 'Failed to log in with share link.')
          router.replace('/unauthorized')
        }
      } catch (err) {
        console.error('Error during share token verification:', err)
        setError('An unexpected error occurred.')
        toast.error('An unexpected error occurred.')
        router.replace('/unauthorized')
      } finally {
        setLoading(false)
      }
    }

    verifyTokenAndLogin()
  }, [token, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle>Verifying Share Link...</CardTitle>
            <CardDescription>Please wait while we secure your access.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This may take a moment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>There was an issue with your share link.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <a href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                Go to Login
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null // Should redirect before this point
}