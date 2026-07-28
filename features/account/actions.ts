"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileValues } from "@/schemas/admin.schema";

export async function updateProfile(values: ProfileValues) {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check your details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You are not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      gender: parsed.data.gender ?? null,
    })
    .eq("id", user.id);

  if (error) return { ok: false as const, error: "Could not save your profile." };

  revalidatePath("/account", "layout");
  return { ok: true as const };
}

export async function toggleFavorite(serviceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You are not signed in." };

  const { data: existing } = await supabase
    .from("favorites")
    .select("service_id")
    .eq("customer_id", user.id)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("customer_id", user.id)
      .eq("service_id", serviceId);
  } else {
    await supabase
      .from("favorites")
      .insert({ customer_id: user.id, service_id: serviceId });
  }

  revalidatePath("/account/favorites");
  return { ok: true as const, favorited: !existing };
}
