import { z } from "zod";

export const endAssignmentSchema = z.object({
  assignmentId: z.string().uuid(),
  fechaFin: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format for End Date",
  }),
});
