import { z } from "zod";

export const createAssignmentSchema = z.object({
  empleadoId: z.string().uuid({ message: "Invalid employee ID format." }),
  obraId: z.string().uuid({ message: "Invalid project ID format." }),
  fechaInicio: z.string().min(1, "Start date is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Start Date"),
  fechaFin: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for End Date").optional()
  ),
  tipoContrato: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.enum(["planta_permanente", "contratado", "eventual"], {
      message: "Invalid contract type.",
    })
  ),
  categoria: z.enum(["oficial", "medio_oficial", "ayudante", "peon"], {
    message: "Invalid category.",
  }).optional(),
  salario: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, { message: "Salary must be a non-negative number." }).optional()
  ),
  estado: z.enum(["activo", "finalizado", "suspendido"], {
    message: "Invalid assignment status.",
  }).default("activo"),
  observaciones: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;
