import { z } from "zod";

export const endAssignmentSchema = z.object({
  assignment_id: z.string().uuid(),
  fecha_fin: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format for End Date",
  }),
});
