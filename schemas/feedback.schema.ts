import { z } from "zod";

export const feedbackSchema = z.object({
  customer_name: z.string().min(2, "Enter your name"),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().min(10, "Tell us a little more (10 characters minimum)"),
  service_id: z.string().uuid().optional().or(z.literal("")),
});

export type FeedbackValues = z.infer<typeof feedbackSchema>;
