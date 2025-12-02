import { z } from "zod";

export const createAssignmentSchema = z.object({
  empleado_id: z.string().uuid({ message: "Invalid employee ID format." }),
  obra_id: z.string().uuid({ message: "Invalid project ID format." }),
  fecha_inicio: z.string().min(1, "Start date is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for Start Date"),
  fecha_fin: z.string().transform(e => e === "" ? undefined : e).optional().refine((val) => {
    if (val === undefined) return true;
    return !isNaN(new Date(val as string).getTime());
  }, "Invalid date format for End Date"),
  tipo_contrato: z.preprocess(
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
  observaciones: z.string().optional().or(z.literal('')),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;
