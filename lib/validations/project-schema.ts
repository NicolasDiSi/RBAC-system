import { z } from "zod";

export const createProjectSchema = z.object({
  nombre: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  codigo: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().max(50, { message: "Project code must be at most 50 characters." }).optional()
  ),
  ubicacion: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
  fechaInicio: z.string().min(1, "Start date is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Start Date"),
  fechaFinEstimada: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Estimated End Date").optional()
  ),
  estado: z.enum(["planificada", "en_curso", "finalizada", "suspendida"], {
    message: "Invalid project status.",
  }).default("planificada"),
  presupuesto: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, { message: "Budget must be a non-negative number." }).optional()
  ),
  descripcion: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
});

export const editProjectSchema = z.object({
  nombre: z.string().min(2, { message: "Project name must be at least 2 characters." }).optional(),
  codigo: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().max(50, { message: "Project code must be at most 50 characters." }).optional()
  ),
  ubicacion: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
  fechaInicio: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Start Date").optional()
  ),
  fechaFinEstimada: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Estimated End Date").optional()
  ),
  fechaFinReal: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Real End Date").optional()
  ),
  estado: z.enum(["planificada", "en_curso", "finalizada", "suspendida"], {
    message: "Invalid project status.",
  }).optional(),
  presupuesto: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, { message: "Budget must be a non-negative number." }).optional()
  ),
  descripcion: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type EditProjectFormValues = z.infer<typeof editProjectSchema>;
