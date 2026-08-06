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
import { deleteStaff } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Staff", robots: { index: false } };

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase.from("staff").select("*").order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-medium">Staff</h1>
        <Button asChild>
          <Link href="/admin/staff/new">
            <Plus />
            Add staff
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(staff ?? []).map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.full_name}</TableCell>
                <TableCell>{person.title ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={person.is_active ? "olive" : "neutral"}>
                    {person.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/staff/${person.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      action={async () => {
                        "use server";
                        return deleteStaff(person.id);
                      }}
                      confirmMessage={`Remove ${person.full_name}? If they have bookings they will be deactivated instead.`}
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
