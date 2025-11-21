import { NextResponse } from 'next/server'
import { getSignupCodeByCode } from '@/lib/data/signupCode'
import { markSignupCodeAsUsed } from '@/app/actions/signupCode'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ message: 'Signup code is required' }, { status: 400 })
    }

    const signupCode = await getSignupCodeByCode(code)

    if (!signupCode) {
      return NextResponse.json({ message: 'Invalid signup code' }, { status: 404 })
    }

    if (signupCode.is_used) {
      return NextResponse.json({ message: 'Signup code has already been used' }, { status: 409 })
    }

    if (new Date(signupCode.expires_at) < new Date()) {
      return NextResponse.json({ message: 'Signup code has expired' }, { status: 410 })
    }

    // Mark the code as used immediately to prevent race conditions
    await markSignupCodeAsUsed(signupCode.id)

    return NextResponse.json(
      { message: 'Signup code verified successfully', userId: signupCode.user_id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying signup code:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
