import { NextResponse } from 'next/server'
import { createSignupCode, getAllSignupCodes, deleteSignupCode } from '@/app/actions/signupCode' // Updated import
import { checkPermission } from '@/lib/services/auth/permissions'

export async function GET(request: Request) {
  try {
    const hasPermission = await checkPermission('users.read_signup_codes') // New permission
    if (!hasPermission) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const signupCodes = await getAllSignupCodes()
    return NextResponse.json(signupCodes)
  } catch (error) {
    console.error('Error fetching signup codes:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const hasPermission = await checkPermission('users.generate_signup_code')
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

export async function DELETE(request: Request) {
  try {
    const hasPermission = await checkPermission('users.delete_signup_code') // New permission
    if (!hasPermission) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'Signup code ID is required' }, { status: 400 })
    }

    await deleteSignupCode(id)

    return NextResponse.json({ message: 'Signup code deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting signup code:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
