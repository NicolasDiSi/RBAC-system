import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirm_password: z.string(),
    sign_out_user: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export const resetPasswordSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
})