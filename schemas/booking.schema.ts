import { z } from "zod";
import { GENDERS } from "@/lib/constants";

export const bookingDetailsSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(6, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  gender: z.enum(GENDERS).optional(),
  notes: z.string().max(600, "Keep notes under 600 characters").optional(),
});

export type BookingDetailsValues = z.infer<typeof bookingDetailsSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Tell us a little more (10 characters minimum)"),
});

export type ContactValues = z.infer<typeof contactSchema>;
