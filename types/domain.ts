import type { Tables } from "@/types/supabase";
import type { AppointmentStatus, Gender } from "@/lib/constants";

export type Profile = Tables<"profiles">;
export type Customer = Tables<"customers">;
export type Category = Tables<"categories">;
export type Staff = Tables<"staff">;
export type GalleryItem = Tables<"gallery_items">;
export type Testimonial = Tables<"testimonials">;
export type Promotion = Tables<"promotions">;
export type BusinessHour = Tables<"business_hours">;
export type Holiday = Tables<"holidays">;
export type ContactMessage = Tables<"contact_messages">;

export type Service = Tables<"services">;

export type ServiceWithCategory = Service & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Appointment = Omit<Tables<"appointments">, "status" | "gender"> & {
  status: AppointmentStatus;
  gender: Gender | null;
};

export type AppointmentWithRelations = Appointment & {
  service: Pick<Service, "id" | "name" | "slug" | "duration_minutes" | "price"> | null;
  staff: Pick<Staff, "id" | "full_name" | "title" | "photo_url"> | null;
  customer?: Pick<Customer, "id" | "full_name" | "phone"> | null;
};

export type TestimonialWithService = Testimonial & {
  service: Pick<Service, "id" | "name" | "slug"> | null;
};

export type PromotionWithRelations = Promotion & {
  service: Pick<Service, "id" | "name" | "slug"> | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type SiteSettings = Record<string, string>;
