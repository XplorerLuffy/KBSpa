import type { Metadata } from "next";
import Link from "next/link";
import { HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { createClient } from "@/lib/supabase/server";
import type { ServiceWithCategory } from "@/types/domain";

export const metadata: Metadata = { title: "Favourites", robots: { index: false } };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("service:services(*, category:categories(id, name, slug))")
    .order("created_at", { ascending: false });

  const services = (data ?? [])
    .map((row) => row.service as unknown as ServiceWithCategory)
    .filter(Boolean);

  if (services.length === 0) {
    return (
      <EmptyState
        icon={HeartOff}
        title="No favourites yet"
        description="Save the treatments you love and they will show up here."
        action={
          <Button asChild>
            <Link href="/services">Browse services</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-7 sm:grid-cols-2">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
