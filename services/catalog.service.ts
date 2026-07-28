import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Service,
  ServiceWithCategory,
  Staff,
} from "@/types/domain";

const SERVICE_WITH_CATEGORY = "*, category:categories(id, name, slug)";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getServices(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  limit?: number;
  search?: string;
}): Promise<ServiceWithCategory[]> {
  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select(SERVICE_WITH_CATEGORY)
    .eq("is_active", true)
    .order("sort_order");

  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,short_description.ilike.%${options.search}%,description.ilike.%${options.search}%`,
    );
  }

  const { data } = await query;
  const services = (data ?? []) as unknown as ServiceWithCategory[];

  if (!options?.categorySlug || options.categorySlug === "all") return services;
  return services.filter((s) => s.category?.slug === options.categorySlug);
}

export async function getServiceBySlug(
  slug: string,
): Promise<ServiceWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select(SERVICE_WITH_CATEGORY)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as unknown as ServiceWithCategory) ?? null;
}

export async function getAllServiceSlugs(): Promise<
  Pick<Service, "slug" | "updated_at">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("slug, updated_at")
    .eq("is_active", true);
  return data ?? [];
}

export async function getStaff(): Promise<Staff[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

/** Therapists qualified for a service. Falls back to all staff if none are mapped. */
export async function getStaffForService(serviceId: string): Promise<Staff[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_services")
    .select("staff:staff(*)")
    .eq("service_id", serviceId);

  const mapped = (data ?? [])
    .map((row) => row.staff as unknown as Staff)
    .filter((s): s is Staff => Boolean(s?.is_active))
    .sort((a, b) => a.sort_order - b.sort_order);

  return mapped.length > 0 ? mapped : getStaff();
}
