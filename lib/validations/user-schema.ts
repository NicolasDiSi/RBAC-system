import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional().or(z.literal('')),
  role_id: z.string().nullable(),
  is_active: z.boolean(),
})

// Base schema for common fields
const baseUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional().or(z.literal('')),
  role_id: z.preprocess(
    (val) => (val === "" || val === null ? null : val),
    z.string().uuid({ message: "Invalid role ID." }).nullable()
  ),
  is_active: z.boolean(),
})

// Schema for creating a new user (password is required)
export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

// Schema for editing an existing user (password is optional but validated if provided)
export const editUserSchema = baseUserSchema.extend({
  password: z.string().optional().refine(val => val === '' || (val?.length || 0) >= 8, {
    message: 'Password must be at least 8 characters if provided.',
  }),
})
