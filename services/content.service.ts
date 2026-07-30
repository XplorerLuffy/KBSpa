import { createClient } from "@/lib/supabase/server";
import type {
  BusinessHour,
  GalleryItem,
  Promotion,
  SiteSettings,
  TestimonialWithService,
} from "@/types/domain";

/**
 * Peels off accidental JSON encoding layers.
 *
 * A settings value is a jsonb string, so it arrives already decoded. Rows
 * written before the double-encoding fix hold text that is itself a quoted
 * JSON string (`"\"+975…\""`), which would otherwise render with visible
 * quotes. Unwrapping on read means old rows display correctly whether or not
 * they have been re-saved.
 */
export function decodeSettingValue(raw: unknown): string {
  let value = typeof raw === "string" ? raw : String(raw ?? "");

  for (let i = 0; i < 10; i++) {
    const trimmed = value.trim();
    // [\s\S] rather than the /s flag, which needs an es2018+ target.
    if (!/^"[\s\S]*"$/.test(trimmed)) break;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed !== "string" || parsed === value) break;
      value = parsed;
    } catch {
      break;
    }
  }

  // Legacy rows can also carry stray escape characters that were never valid
  // JSON, so trimming them is the only way to recover the original text. Gated
  // on a backslash being present so a value the admin deliberately typed in
  // quotes ( He said "hi" ) is left alone.
  return /\\/.test(value)
    ? value.replace(/^[\\"\s]+|[\\"\s]+$/g, "")
    : value;
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");

  return Object.fromEntries(
    (data ?? []).map(({ key, value }) => [key, decodeSettingValue(value)]),
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

export async function getHomeStats(): Promise<{
  serviceCount: number;
  staffCount: number;
  averageRating: number | null;
  reviewCount: number;
}> {
  const supabase = await createClient();
  const [{ count: serviceCount }, { count: staffCount }, { data: ratings }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("testimonials").select("rating").eq("is_approved", true),
    ]);

  const reviewCount = ratings?.length ?? 0;
  const averageRating =
    reviewCount > 0
      ? ratings!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  return {
    serviceCount: serviceCount ?? 0,
    staffCount: staffCount ?? 0,
    averageRating,
    reviewCount,
  };
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
