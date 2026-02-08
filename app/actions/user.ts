'use server'

import * as UserDAO from '@/lib/data/user'
import { createVerificationToken } from './verificationToken'
import { sendPasswordResetEmail } from '@/lib/services/email'

export async function updateUserPassword(userId: string, newPasswordPlain: string): Promise<void> {
  await UserDAO.updateUserPassword(userId, newPasswordPlain)
}

export async function linkGoogleAccountToUser(
  userId: string,
  googleId: string,
  googleEmail: string,
  googleName: string,
  googleAvatarUrl: string | null
): Promise<void> {
  await UserDAO.updateUser(userId, {
    googleId: googleId,
    email: googleEmail,
    name: googleName,
    avatarUrl: googleAvatarUrl,
  })
}

export async function recoverPassword(email: string): Promise<void> {
  const user = await UserDAO.getUserByEmail(email)
  if (user) {
    const { token } = await createVerificationToken(user.id, 'password_reset')
    try {
      await sendPasswordResetEmail(user.email, token)
    } catch (error) {
      console.error("Failed to queue password reset email:", error)
      throw new Error("Could not send reset email. Please try again later.")
    }
  }
}
