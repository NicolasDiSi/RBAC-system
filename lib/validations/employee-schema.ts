import { z } from "zod";

export const employeeSchema = z.object({
  nombre: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  apellido: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  dni: z.string().min(8, { message: 'DNI must be at least 8 characters.' }),
  fecha_nacimiento: z.string().min(1, "Fecha de Nacimiento is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Fecha de Nacimiento"),
  telefono: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  direccion: z.string().optional(),
  fecha_ingreso: z.string().min(1, "Fecha de Ingreso is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Fecha de Ingreso"),
  tipo_contrato: z.string().min(1, { message: 'Invalid contract type.' }),
  categoria: z.string().min(1, { message: 'Invalid category.' }),
  observaciones: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;