"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  businessHourSchema,
  categorySchema,
  galleryItemSchema,
  holidaySchema,
  promotionSchema,
  serviceSchema,
  staffSchema,
  testimonialSchema,
} from "@/schemas/admin.schema";
import type { AppointmentStatus } from "@/lib/constants";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("FORBIDDEN");
  return supabase;
}

function fail(message: string): Result {
  return { ok: false, error: message };
}

/* -------------------------------------------------- bookings */

export async function setAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) return fail("Could not update the booking.");

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

/* -------------------------------------------------- categories */

export async function saveCategory(
  formData: FormData,
  id?: string,
): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image_url: formData.get("image_url") || "",
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) return fail("Please check the form.");

  const payload = { ...parsed.data, image_url: parsed.data.image_url || null };
  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (error) return fail("Could not save the category.");

  revalidatePath("/admin/categories");
  revalidatePath("/services");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail("Could not delete the category.");

  revalidatePath("/admin/categories");
  return { ok: true };
}

/* -------------------------------------------------- services */

export async function saveService(formData: FormData, id?: string): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id") || "",
    short_description: formData.get("short_description") || undefined,
    description: formData.get("description") || undefined,
    benefits: formData.get("benefits") || undefined,
    duration_minutes: formData.get("duration_minutes"),
    price: formData.get("price"),
    image_url: formData.get("image_url") || "",
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) return fail("Please check the form.");

  const { benefits, category_id, image_url, ...rest } = parsed.data;
  const payload = {
    ...rest,
    category_id: category_id || null,
    image_url: image_url || null,
    benefits: benefits
      ? benefits
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
  };

  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", id)
    : await supabase.from("services").insert(payload);

  if (error) return fail("Could not save the service.");

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true };
}

export async function deleteService(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  // Services referenced by bookings cannot be removed, so retire them instead.
  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("service_id", id);

  const { error } =
    count && count > 0
      ? await supabase.from("services").update({ is_active: false }).eq("id", id)
      : await supabase.from("services").delete().eq("id", id);

  if (error) return fail("Could not delete the service.");

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true };
}

/* -------------------------------------------------- staff */

export async function saveStaff(formData: FormData, id?: string): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = staffSchema.safeParse({
    full_name: formData.get("full_name"),
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
    photo_url: formData.get("photo_url") || "",
    is_active: formData.get("is_active") === "on",
    sort_order: formData.get("sort_order") || 0,
    service_ids: formData.getAll("service_ids").map(String),
  });

  if (!parsed.success) return fail("Please check the form.");

  const { service_ids, photo_url, ...rest } = parsed.data;
  const payload = { ...rest, photo_url: photo_url || null };

  const { data, error } = id
    ? await supabase.from("staff").update(payload).eq("id", id).select("id").single()
    : await supabase.from("staff").insert(payload).select("id").single();

  if (error || !data) return fail("Could not save the staff member.");

  await supabase.from("staff_services").delete().eq("staff_id", data.id);
  if (service_ids.length > 0) {
    await supabase
      .from("staff_services")
      .insert(service_ids.map((service_id) => ({ staff_id: data.id, service_id })));
  }

  revalidatePath("/admin/staff");
  revalidatePath("/about");
  return { ok: true };
}

export async function deleteStaff(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", id);

  const { error } =
    count && count > 0
      ? await supabase.from("staff").update({ is_active: false }).eq("id", id)
      : await supabase.from("staff").delete().eq("id", id);

  if (error) return fail("Could not delete the staff member.");

  revalidatePath("/admin/staff");
  return { ok: true };
}

/* -------------------------------------------------- schedule */

export async function saveBusinessHours(formData: FormData): Promise<Result> {
  const supabase = await requireAdmin();

  const rows = Array.from({ length: 7 }, (_, weekday) =>
    businessHourSchema.parse({
      weekday,
      is_closed: formData.get(`is_closed_${weekday}`) === "on",
      open_time: formData.get(`open_time_${weekday}`),
      close_time: formData.get(`close_time_${weekday}`),
    }),
  );

  const { error } = await supabase.from("business_hours").upsert(rows);
  if (error) return fail("Could not save the opening hours.");

  revalidatePath("/admin/business-hours");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveHoliday(formData: FormData): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = holidaySchema.safeParse({
    date: formData.get("date"),
    staff_id: formData.get("staff_id") || "",
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) return fail("Please choose a date.");

  const { error } = await supabase.from("holidays").insert({
    date: parsed.data.date,
    staff_id: parsed.data.staff_id || null,
    reason: parsed.data.reason ?? null,
  });

  if (error) return fail("Could not add this date — it may already be blocked.");

  revalidatePath("/admin/holidays");
  return { ok: true };
}

export async function deleteHoliday(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("holidays").delete().eq("id", id);
  if (error) return fail("Could not remove the date.");

  revalidatePath("/admin/holidays");
  return { ok: true };
}

/* -------------------------------------------------- content */

export async function saveGalleryItem(
  formData: FormData,
  id?: string,
): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = galleryItemSchema.safeParse({
    image_url: formData.get("image_url"),
    caption: formData.get("caption") || undefined,
    category: formData.get("category") || undefined,
    is_featured: formData.get("is_featured") === "on",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) return fail("Enter a valid image URL.");

  const { error } = id
    ? await supabase.from("gallery_items").update(parsed.data).eq("id", id)
    : await supabase.from("gallery_items").insert(parsed.data);

  if (error) return fail("Could not save the image.");

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteGalleryItem(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return fail("Could not delete the image.");

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function saveTestimonial(
  formData: FormData,
  id?: string,
): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = testimonialSchema.safeParse({
    customer_name: formData.get("customer_name"),
    avatar_url: formData.get("avatar_url") || "",
    rating: formData.get("rating"),
    quote: formData.get("quote"),
    service_id: formData.get("service_id") || "",
    is_approved: formData.get("is_approved") === "on",
    is_featured: formData.get("is_featured") === "on",
  });

  if (!parsed.success) return fail("Please check the form.");

  const payload = {
    ...parsed.data,
    avatar_url: parsed.data.avatar_url || null,
    service_id: parsed.data.service_id || null,
  };

  const { error } = id
    ? await supabase.from("testimonials").update(payload).eq("id", id)
    : await supabase.from("testimonials").insert(payload);

  if (error) return fail("Could not save the testimonial.");

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return fail("Could not delete the testimonial.");

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function approveTestimonial(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("testimonials")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) return fail("Could not approve the review.");

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function savePromotion(formData: FormData, id?: string): Promise<Result> {
  const supabase = await requireAdmin();
  const parsed = promotionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    discount_type: formData.get("discount_type") || undefined,
    discount_value: formData.get("discount_value") || undefined,
    banner_image_url: formData.get("banner_image_url") || "",
    starts_at: formData.get("starts_at") || undefined,
    ends_at: formData.get("ends_at") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) return fail("Please check the form.");

  const payload = {
    ...parsed.data,
    banner_image_url: parsed.data.banner_image_url || null,
    starts_at: parsed.data.starts_at || null,
    ends_at: parsed.data.ends_at || null,
  };

  const { error } = id
    ? await supabase.from("promotions").update(payload).eq("id", id)
    : await supabase.from("promotions").insert(payload);

  if (error) return fail("Could not save the promotion.");

  revalidatePath("/admin/promotions");
  return { ok: true };
}

export async function deletePromotion(id: string): Promise<Result> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) return fail("Could not delete the promotion.");

  revalidatePath("/admin/promotions");
  return { ok: true };
}

/* -------------------------------------------------- settings */

export async function saveSettings(formData: FormData): Promise<Result> {
  const supabase = await requireAdmin();

  const rows = [...formData.entries()]
    .filter(([key]) => key.startsWith("setting_"))
    .map(([key, value]) => ({
      key: key.replace("setting_", ""),
      // Pass the plain string. `value` is jsonb and supabase-js already
      // JSON-encodes the request body, so calling JSON.stringify here wrapped
      // the text in a second set of quotes — and because the mangled value was
      // read back into the form, every save added another layer
      // (`"+975…"` -> `"\"+975…\""` -> …).
      value: String(value).trim(),
    }));

  if (rows.length === 0) return { ok: true };

  const { error } = await supabase.from("settings").upsert(rows);
  if (error) return fail("Could not save the settings.");

  revalidatePath("/", "layout");
  return { ok: true };
}
