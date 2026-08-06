import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { StaffForm } from "@/features/admin/components/StaffForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit staff", robots: { index: false } };

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: staff }, { data: services }, { data: assigned }] = await Promise.all([
    supabase.from("staff").select("*").eq("id", id).maybeSingle(),
    supabase.from("services").select("*").order("sort_order"),
    supabase.from("staff_services").select("service_id").eq("staff_id", id),
  ]);

  if (!staff) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-medium">Edit {staff.full_name}</h1>
      <Card className="max-w-3xl p-7">
        <StaffForm
          services={services ?? []}
          staff={staff}
          assignedServiceIds={(assigned ?? []).map((row) => row.service_id)}
        />
      </Card>
    </div>
  );
}
