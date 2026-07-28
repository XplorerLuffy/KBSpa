import type { Metadata } from "next";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [{ data: profiles }, { data: appointments }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("appointments").select("customer_id, status"),
  ]);

  const bookingCounts = new Map<string, number>();
  for (const row of appointments ?? []) {
    if (["cancelled", "rejected"].includes(row.status)) continue;
    bookingCounts.set(row.customer_id, (bookingCounts.get(row.customer_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Customers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {(profiles ?? []).length} registered
        </p>
      </div>

      <Card className="overflow-hidden">
        {(profiles ?? []).length === 0 ? (
          <EmptyState className="border-0" icon={Users} title="No customers yet" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(profiles ?? []).map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {profile.phone ?? "—"}
                  </TableCell>
                  <TableCell>{bookingCounts.get(profile.id) ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={profile.role === "admin" ? "default" : "neutral"}>
                      {profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(profile.created_at), "d MMM yyyy")}
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
