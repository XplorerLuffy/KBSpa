import { createClient } from "@/lib/supabase/server";
import type {
  BusinessHour,
  GalleryItem,
  Promotion,
  SiteSettings,
  TestimonialWithService,
} from "@/types/domain";

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");

  return Object.fromEntries(
    (data ?? []).map(({ key, value }) => [
      key,
      typeof value === "string" ? value : String(value ?? ""),
    ]),
  );
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_hours")
    .select("*")
    .order("weekday");
  return data ?? [];
}

export async function getGalleryItems(category?: string): Promise<GalleryItem[]> {
  const supabase = await createClient();
  let query = supabase.from("gallery_items").select("*").order("sort_order");
  if (category && category !== "all") query = query.eq("category", category);
  const { data } = await query;
  return data ?? [];
}

export async function getGalleryCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("gallery_items").select("category");
  const unique = new Set(
    (data ?? []).map((row) => row.category).filter((c): c is string => Boolean(c)),
  );
  return [...unique].sort();
}

export async function getTestimonials(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<TestimonialWithService[]> {
  const supabase = await createClient();
  let query = supabase
    .from("testimonials")
    .select("*, service:services(id, name, slug)")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data } = await query;
  return (data ?? []) as unknown as TestimonialWithService[];
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false });
  return data ?? [];
}
