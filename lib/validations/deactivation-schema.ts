import { z } from "zod";

export const deactivateEmployeeSchema = z.object({
  fecha_egreso: z.string().min(1, "End date is required").refine((val) => !isNaN(new Date(val).getTime()), "Invalid date format for End Date"),
});

export type DeactivateEmployeeFormValues = z.infer<typeof deactivateEmployeeSchema>;
