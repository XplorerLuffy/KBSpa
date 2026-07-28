import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithRelations } from "@/types/domain";

const WITH_RELATIONS =
  "*, service:services(id, name, slug, duration_minutes, price), staff:staff(id, full_name, title, photo_url)";

const WITH_CUSTOMER = `${WITH_RELATIONS}, customer:profiles(id, full_name, phone)`;

export async function getMyAppointments(): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(WITH_RELATIONS)
    .order("start_time", { ascending: false });
  return (data ?? []) as unknown as AppointmentWithRelations[];
}

export async function getAppointmentById(
  id: string,
): Promise<AppointmentWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(WITH_CUSTOMER)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as AppointmentWithRelations) ?? null;
}

export async function getAppointmentsInRange(
  from: Date,
  to: Date,
): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(WITH_CUSTOMER)
    .gte("start_time", from.toISOString())
    .lt("start_time", to.toISOString())
    .order("start_time");
  return (data ?? []) as unknown as AppointmentWithRelations[];
}

export async function getAllAppointments(options?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: AppointmentWithRelations[]; count: number }> {
  const supabase = await createClient();
  const pageSize = options?.pageSize ?? 20;
  const page = options?.page ?? 1;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("appointments")
    .select(WITH_CUSTOMER, { count: "exact" })
    .order("start_time", { ascending: false })
    .range(from, from + pageSize - 1);

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  const { data, count } = await query;
  return {
    rows: (data ?? []) as unknown as AppointmentWithRelations[],
    count: count ?? 0,
  };
}
