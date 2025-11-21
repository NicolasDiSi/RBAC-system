import { NextResponse } from 'next/server'
import { createSignupCode } from '@/app/actions/signupCode'
import { checkPermission } from '@/lib/services/auth/permissions'

export async function POST(request: Request) {
  try {
    const hasPermission = await checkPermission('users.generate_signup_code') // New permission
    if (!hasPermission) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { userId, expirationDuration } = await request.json()

    if (!userId || !expirationDuration) {
      return NextResponse.json({ message: 'User ID and expiration duration are required' }, { status: 400 })
    }

    const signupCode = await createSignupCode(userId, expirationDuration)

    return NextResponse.json({ message: 'Signup code generated successfully', code: signupCode.code }, { status: 201 })
  } catch (error) {
    console.error('Error generating signup code:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
