import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional().or(z.literal('')),
  roleId: z.preprocess(
    (val) => (val === "" || val === "null" ? null : val),
    z.string().nullable()
  ),
  isActive: z.preprocess(
    (val) => val === 'true' || val === 'on' || val === true,
    z.boolean()
  ),
})

// Base schema for common fields
const baseUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  roleId: z.preprocess(
    (val) => (val === "" || val === "null" ? null : val),
    z.string().nullable()
  ),
  isActive: z.preprocess(
    (val) => val === 'true' || val === 'on' || val === true,
    z.boolean()
  ),
})

// Schema for creating a new user (password is required)
export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

// Schema for editing an existing user (password is optional but validated if provided)
export const editUserSchema = baseUserSchema.extend({
  password: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional()
  ),
})
