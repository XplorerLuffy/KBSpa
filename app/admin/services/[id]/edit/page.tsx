import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/admin/components/ServiceForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit service", robots: { index: false } };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: service }, { data: categories }] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-medium">Edit {service.name}</h1>
      <Card className="max-w-3xl p-7">
        <ServiceForm categories={categories ?? []} service={service} />
      </Card>
    </div>
  );
}
