import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name"),
  slug: z.string().min(2, "Enter a slug"),
  description: z.string().optional(),
  image_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Enter a service name"),
  slug: z.string().min(2, "Enter a slug"),
  category_id: z.string().uuid("Choose a category").optional().or(z.literal("")),
  short_description: z.string().optional(),
  description: z.string().optional(),
  benefits: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(5, "Minimum 5 minutes"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  image_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const staffSchema = z.object({
  full_name: z.string().min(2, "Enter a name"),
  title: z.string().optional(),
  bio: z.string().optional(),
  photo_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
  service_ids: z.array(z.string().uuid()).default([]),
});

export const holidaySchema = z.object({
  date: z.string().min(1, "Choose a date"),
  staff_id: z.string().uuid().optional().or(z.literal("")),
  reason: z.string().optional(),
});

export const businessHourSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  is_closed: z.boolean(),
  open_time: z.string(),
  close_time: z.string(),
});

export const galleryItemSchema = z.object({
  image_url: z.string().url("Enter a valid image URL"),
  caption: z.string().optional(),
  category: z.string().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const testimonialSchema = z.object({
  customer_name: z.string().min(2, "Enter a name"),
  avatar_url: z.string().url().optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().min(10, "Enter the review text"),
  service_id: z.string().uuid().optional().or(z.literal("")),
  is_approved: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

export const promotionSchema = z.object({
  title: z.string().min(2, "Enter a title"),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]).optional(),
  discount_value: z.coerce.number().min(0).optional(),
  banner_image_url: z.string().url().optional().or(z.literal("")),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  is_active: z.boolean().default(false),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  phone: z.string().optional(),
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]).optional(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
export type ServiceValues = z.infer<typeof serviceSchema>;
export type StaffValues = z.infer<typeof staffSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
