export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  no_show: "No show",
};

/** Tailwind classes for status chips, shared by the admin calendar and booking tables. */
export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-gold-100 text-gold-800 border-gold-300",
  confirmed: "bg-olive-100 text-olive-800 border-olive-300",
  completed: "bg-olive-600 text-white border-olive-700",
  cancelled: "bg-charcoal-50 text-charcoal-400 border-beige-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  no_show: "bg-slate-100 text-slate-600 border-slate-300",
};

export const GENDERS = ["female", "male", "other", "prefer_not_to_say"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  female: "Female",
  male: "Male",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEFAULT_SLOT_INTERVAL_MINUTES = 30;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

export const SETTINGS_KEYS = [
  "business_name",
  "tagline",
  "logo_url",
  "phone",
  "email",
  "whatsapp",
  "address",
  "map_embed_url",
  "facebook_url",
  "instagram_url",
  "booking_slot_interval_minutes",
] as const;

export type SettingKey = (typeof SETTINGS_KEYS)[number];
