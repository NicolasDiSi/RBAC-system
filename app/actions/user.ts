'use server'

import * as UserDAO from '@/lib/data/user'

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
