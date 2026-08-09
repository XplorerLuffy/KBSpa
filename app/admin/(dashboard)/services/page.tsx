import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/features/admin/components/AdminForm";
import { deleteService } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { ServiceWithCategory } from "@/types/domain";

export const metadata: Metadata = { title: "Services", robots: { index: false } };

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*, category:categories(id, name, slug)")
    .order("sort_order");

  const services = (data ?? []) as unknown as ServiceWithCategory[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">Services</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {services.length} treatments
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus />
            New service
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.category?.name ?? "—"}</TableCell>
                <TableCell>
                  {service.duration_minutes != null
                    ? formatDuration(service.duration_minutes)
                    : "—"}
                </TableCell>
                <TableCell>{formatCurrency(service.price)}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Badge variant={service.is_active ? "olive" : "neutral"}>
                      {service.is_active ? "Active" : "Hidden"}
                    </Badge>
                    {service.is_featured && <Badge>Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/services/${service.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      action={async () => {
                        "use server";
                        return deleteService(service.id);
                      }}
                      confirmMessage={`Delete "${service.name}"? If it has bookings it will be hidden instead.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
