import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/admin/components/ServiceForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New service", robots: { index: false } };

export default async function NewServicePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-medium">New service</h1>
      <Card className="max-w-3xl p-7">
        <ServiceForm categories={categories ?? []} />
      </Card>
    </div>
  );
}
