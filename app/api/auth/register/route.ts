import { NextResponse } from 'next/server'
import { getSupabaseServiceRoleClient } from '@/lib/services/supabase/server'
import { getSignupCodeByCode } from '@/lib/data/signupCode'
import { createVerificationToken } from '@/app/actions/verificationToken'
import { sendVerificationEmail } from '@/lib/services/email'

export async function POST(request: Request) {
  const { name, email, password, code } = await request.json()
  const supabase = await getSupabaseServiceRoleClient()

  // 1. Validate all inputs
  if (!name || !email || !password || !code) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 })
  }

  // 2. Validate the signup code
  const signupCode = await getSignupCodeByCode(code)
  if (!signupCode) {
    return NextResponse.json({ message: 'Invalid signup code.' }, { status: 404 })
  }
  if (signupCode.is_used) {
    return NextResponse.json({ message: 'This signup code has already been used.' }, { status: 409 })
  }
  if (new Date(signupCode.expires_at) < new Date()) {
    return NextResponse.json({ message: 'This signup code has expired.' }, { status: 410 })
  }
  if (!signupCode.role_id) {
    return NextResponse.json({ message: 'The signup code is not configured correctly (missing role).' }, { status: 500 })
  }

  // 3. Sign up the user with Supabase Auth
  // Assuming Supabase email confirmation is disabled, we will send our custom email.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // You can add metadata here if needed
      },
    },
  })

  if (authError) {
    return NextResponse.json({ message: authError.message }, { status: 400 })
  }

  const newUser = authData.user
  if (!newUser) {
    return NextResponse.json({ message: 'User could not be created.' }, { status: 500 })
  }

  // 4. Create the user profile in the public 'users' table
  const { error: profileError } = await supabase.from('users').insert({
    id: newUser.id,
    name,
    email,
    role_id: signupCode.role_id,
  })

  if (profileError) {
    // If profile creation fails, we should ideally delete the auth user to avoid orphans
    await supabase.auth.admin.deleteUser(newUser.id)
    console.error('Error creating user profile:', profileError)
    return NextResponse.json({ message: 'Could not create user profile.' }, { status: 500 })
  }

  // 5. Generate and send custom verification email
  try {
    const { token } = await createVerificationToken(newUser.id, 'email_verification');
    await sendVerificationEmail(newUser.email!, token);
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    // This is not a critical failure for user creation, but should be logged.
    // Consider adding a retry mechanism or alerting system here.
  }

  // 6. Mark the signup code as used
  const { error: codeUpdateError } = await supabase
    .from('signup_codes')
    .update({
      is_used: true,
      used_at: new Date().toISOString(),
      used_by_user_id: newUser.id,
    })
    .eq('id', signupCode.id)

  if (codeUpdateError) {
    // This is not a critical failure; the user is already created.
    // Log the error but don't fail the whole request.
    console.error('Warning: Failed to mark signup code as used:', codeUpdateError)
  }

  return NextResponse.json(
    { message: 'Registration successful! Please check your email for a verification link.' },
    { status: 200 }
  )
}
