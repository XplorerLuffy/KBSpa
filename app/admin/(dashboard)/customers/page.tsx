import type { Metadata } from "next";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Customers", robots: { index: false } };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const [{ data: customers }, { data: appointments }] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("appointments").select("customer_id, status"),
  ]);

  const bookingCounts = new Map<string, number>();
  for (const row of appointments ?? []) {
    if (!row.customer_id || ["cancelled", "rejected"].includes(row.status)) continue;
    bookingCounts.set(row.customer_id, (bookingCounts.get(row.customer_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Customers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {(customers ?? []).length} on record, matched by phone number
        </p>
      </div>

      <Card className="overflow-hidden">
        {(customers ?? []).length === 0 ? (
          <EmptyState className="border-0" icon={Users} title="No customers yet" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>First seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(customers ?? []).map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.email ?? "—"}
                  </TableCell>
                  <TableCell>{bookingCounts.get(customer.id) ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(customer.created_at), "d MMM yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
