import { NextResponse } from 'next/server'
import { getSignupCodeByCode, markSignupCodeAsUsed } from '@/lib/data/signupCode'
import { createUser } from '@/lib/data/user';
import { createVerificationToken } from '@/app/actions/verificationToken'
import { sendVerificationEmail } from '@/lib/services/email'
import { hash } from 'bcrypt';

export async function POST(request: Request) {
  const { name, email, password, code } = await request.json()
  
  // 1. Validate all inputs
  if (!name || !email || !password || !code) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
  }

  // 2. Validate the signup code
  const signupCode = await getSignupCodeByCode(code)
  if (!signupCode) {
    return NextResponse.json({ message: 'Invalid signup code.' }, { status: 404 })
  }
  if (signupCode.isUsed) {
    return NextResponse.json({ message: 'This signup code has already been used.' }, { status: 409 })
  }
  if (new Date(signupCode.expiresAt) < new Date()) {
    return NextResponse.json({ message: 'This signup code has expired.' }, { status: 410 })
  }
  if (!signupCode.roleId) {
    return NextResponse.json({ message: 'The signup code is not configured correctly (missing role).' }, { status: 500 })
  }

  try {
    // 3. Create the user in our public.users table
    const hashedPassword = await hash(password, 12);
    
    const [newUser] = await createUser({
      name,
      email,
      hashedPassword,
      roleId: signupCode.roleId,
    });

    if (!newUser) {
        return NextResponse.json({ message: 'User could not be created.' }, { status: 500 })
    }

    // 4. Generate and send custom verification email
    try {
      const { token } = await createVerificationToken(newUser.id, 'email_verification');
      await sendVerificationEmail(newUser.email!, token);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    // 5. Mark the signup code as used
    try {
        await markSignupCodeAsUsed(signupCode.id, newUser.id);
    } catch (codeUpdateError) {
      console.error('Warning: Failed to mark signup code as used:', codeUpdateError)
    }

    return NextResponse.json(
      { message: 'Registration successful! Please check your email for a verification link.' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Registration error:", error);
    // Check for unique constraint violation (user already exists)
    if (error.code === '23505') { // PostgreSQL unique violation code
        return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}