import { z } from "zod";

export const createEmployeeSchema = z.object({
  nombre: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  apellido: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  dni: z.string().min(8, { message: 'DNI must be at least 8 characters.' }),
  fecha_nacimiento: z.string().min(1, "Fecha de Nacimiento is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Fecha de Nacimiento"),
  telefono: z.string().optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  fecha_ingreso: z.string().min(1, "Fecha de Ingreso is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Fecha de Ingreso"),
  fecha_egreso: z.string().optional().or(z.literal('')),
  tipo_contrato: z.string().min(1, { message: 'Invalid contract type.' }),
  categoria: z.string().min(1, { message: 'Invalid category.' }),
  observaciones: z.string().optional().or(z.literal('')),
});

export const editEmployeeSchema = z.object({
  nombre: z.string().min(2, { message: 'First name must be at least 2 characters.' }).optional(),
  apellido: z.string().min(2, { message: 'Last name must be at least 2 characters.' }).optional(),
  dni: z.string().min(8, { message: 'DNI must be at least 8 characters.' }).optional(),
  fecha_nacimiento: z.string().min(1, "Fecha de Nacimiento is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Fecha de Nacimiento").optional(),
  telefono: z.string().optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  fecha_ingreso: z.string().min(1, "Fecha de Ingreso is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Fecha de Ingreso").optional(),
  fecha_egreso: z.string().optional().or(z.literal('')),
  tipo_contrato: z.string().min(1, { message: 'Invalid contract type.' }).optional(),
  categoria: z.string().min(1, { message: 'Invalid category.' }).optional(),
  observaciones: z.string().optional().or(z.literal('')),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;