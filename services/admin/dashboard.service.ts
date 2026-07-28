import { endOfDay, startOfDay, startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithRelations } from "@/types/domain";

export type DashboardMetrics = {
  todayCount: number;
  monthBookings: number;
  monthRevenue: number;
  pendingCount: number;
  customerCount: number;
  todaysAppointments: AppointmentWithRelations[];
  popularServices: { name: string; count: number }[];
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const now = new Date();
  const dayStart = startOfDay(now).toISOString();
  const dayEnd = endOfDay(now).toISOString();
  const monthStart = startOfMonth(now).toISOString();

  const [today, month, pending, customers] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "*, service:services(id, name, slug, duration_minutes, price), staff:staff(id, full_name, title, photo_url), customer:profiles(id, full_name, phone)",
      )
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd)
      .order("start_time"),
    supabase
      .from("appointments")
      .select("price, status, service_id, services(name)")
      .gte("start_time", monthStart),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const monthRows = month.data ?? [];

  // Revenue only counts appointments that actually happened.
  const monthRevenue = monthRows
    .filter((row) => row.status === "completed")
    .reduce((total, row) => total + Number(row.price ?? 0), 0);

  const serviceCounts = new Map<string, number>();
  for (const row of monthRows) {
    const name = (row.services as unknown as { name: string } | null)?.name;
    if (!name || ["cancelled", "rejected"].includes(row.status)) continue;
    serviceCounts.set(name, (serviceCounts.get(name) ?? 0) + 1);
  }

  return {
    todayCount: today.data?.length ?? 0,
    monthBookings: monthRows.filter(
      (row) => !["cancelled", "rejected"].includes(row.status),
    ).length,
    monthRevenue,
    pendingCount: pending.count ?? 0,
    customerCount: customers.count ?? 0,
    todaysAppointments: (today.data ?? []) as unknown as AppointmentWithRelations[],
    popularServices: [...serviceCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
