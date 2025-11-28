import { z } from "zod";

export const createProjectSchema = z.object({
  nombre: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  codigo: z.string().max(50, { message: "Project code must be at most 50 characters." }).optional().or(z.literal('')),
  ubicacion: z.string().optional().or(z.literal('')),
  fecha_inicio: z.string().min(1, "Start date is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Start Date"),
  fecha_fin_estimada: z.string().transform(e => e === "" ? undefined : e).optional().refine((val) => {
    if (val === undefined) return true;
    return !isNaN(new Date(val as string).getTime());
  }, "Invalid date format for Estimated End Date"),
  estado: z.enum(["planificada", "en_curso", "finalizada", "suspendida"], {
    message: "Invalid project status.",
  }).default("planificada"),
  presupuesto: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(0, { message: "Budget must be a non-negative number." }).optional()
  ),
  descripcion: z.string().optional().or(z.literal('')),
});

export const editProjectSchema = z.object({
  nombre: z.string().min(2, { message: "Project name must be at least 2 characters." }).optional(),
  codigo: z.string().max(50, { message: "Project code must be at most 50 characters." }).optional().or(z.literal('')),
  ubicacion: z.string().optional().or(z.literal('')),
  fecha_inicio: z.string().transform(e => e === "" ? undefined : e).optional().refine((val) => {
    if (val === undefined) return true;
    return !isNaN(new Date(val as string).getTime());
  }, "Invalid date format for Start Date"),
  fecha_fin_estimada: z.string().transform(e => e === "" ? undefined : e).optional().refine((val) => {
    if (val === undefined) return true;
    return !isNaN(new Date(val as string).getTime());
  }, "Invalid date format for Estimated End Date"),
  fecha_fin_real: z.string().transform(e => e === "" ? undefined : e).optional().refine((val) => {
    if (val === undefined) return true;
    return !isNaN(new Date(val as string).getTime());
  }, "Invalid date format for Real End Date"),
  estado: z.enum(["planificada", "en_curso", "finalizada", "suspendida"], {
    message: "Invalid project status.",
  }).optional(),
  presupuesto: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, { message: "Budget must be a non-negative number." }).optional()
  ),
  descripcion: z.string().optional().or(z.literal('')),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type EditProjectFormValues = z.infer<typeof editProjectSchema>;
