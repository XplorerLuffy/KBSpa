import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { CalendarOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminForm, DeleteButton } from "@/features/admin/components/AdminForm";
import { Field, SelectField } from "@/features/admin/components/Field";
import { deleteHoliday, saveHoliday } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Holidays & closures",
  robots: { index: false },
};

export default async function HolidaysPage() {
  const supabase = await createClient();
  const [{ data: holidays }, { data: staff }] = await Promise.all([
    supabase
      .from("holidays")
      .select("*, staff:staff(id, full_name)")
      .order("date", { ascending: true }),
    supabase.from("staff").select("id, full_name").order("sort_order"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Holidays & closures</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Block a whole day for the salon, or just one therapist&rsquo;s vacation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-lg font-medium">Block a date</h2>
          <AdminForm
            action={saveHoliday}
            submitLabel="Block date"
            successMessage="Date blocked"
          >
            <Field name="date" label="Date" type="date" required />
            <SelectField
              name="staff_id"
              label="Applies to"
              placeholder="Whole salon (closed)"
              options={(staff ?? []).map((person) => ({
                value: person.id,
                label: person.full_name,
              }))}
            />
            <Field name="reason" label="Reason (optional)" />
          </AdminForm>
        </Card>

        <Card className="overflow-hidden">
          {(holidays ?? []).length === 0 ? (
            <EmptyState
              className="border-0"
              icon={CalendarOff}
              title="No dates blocked"
              description="Blocked dates disappear from the booking calendar."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(holidays ?? []).map((holiday) => {
                  const person = holiday.staff as unknown as {
                    full_name: string;
                  } | null;
                  return (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(holiday.date), "EEE d MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {person ? (
                          <Badge variant="neutral">{person.full_name}</Badge>
                        ) : (
                          <Badge>Whole salon</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {holiday.reason ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton
                          label="Remove"
                          confirmMessage="Unblock this date?"
                          action={async () => {
                            "use server";
                            return deleteHoliday(holiday.id);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
