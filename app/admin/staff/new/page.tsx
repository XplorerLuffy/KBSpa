import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { StaffForm } from "@/features/admin/components/StaffForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Add staff", robots: { index: false } };

export default async function NewStaffPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-medium">Add staff member</h1>
      <Card className="max-w-3xl p-7">
        <StaffForm services={services ?? []} />
      </Card>
    </div>
  );
}
