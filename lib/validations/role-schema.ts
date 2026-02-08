import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters.' }),
  description: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
})

export const editRoleSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters.' }).optional(),
  description: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
})
