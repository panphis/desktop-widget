import { z } from "zod";

export const eventSchema = z.object({
  user: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"], { required_error: "Color is required" }),
});

export type TEventFormData = z.infer<typeof eventSchema>;
