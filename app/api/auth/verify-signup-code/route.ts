import { NextResponse } from 'next/server'
import { getSignupCodeByCode } from '@/lib/data/signupCode'

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

    if (signupCode.isUsed) {
      return NextResponse.json({ message: 'Signup code has already been used' }, { status: 409 })
    }

    if (new Date(signupCode.expiresAt) < new Date()) {
      return NextResponse.json({ message: 'Signup code has expired' }, { status: 410 })
    }

    return NextResponse.json(
      { message: 'Signup code verified successfully', code: signupCode.code },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying signup code:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
