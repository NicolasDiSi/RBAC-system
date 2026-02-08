import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string(),
    signOutUser: z.preprocess(
      (val) => val === 'true' || val === 'on' || val === true,
      z.boolean().default(false)
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z.object({

  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),

})

export const adminUpdatePasswordSchema = z.object({

  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  signOutUser: z.preprocess(
    (val) => val === 'true' || val === 'on' || val === true,
    z.boolean().default(false)
  ),
});
