import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { AdminForm } from "@/features/admin/components/AdminForm";
import { saveBusinessHours } from "@/features/admin/actions";
import { getBusinessHours } from "@/services/content.service";
import { WEEKDAYS } from "@/lib/constants";

export const metadata: Metadata = { title: "Business hours", robots: { index: false } };

export default async function BusinessHoursPage() {
  const hours = await getBusinessHours();
  const byWeekday = new Map(hours.map((hour) => [hour.weekday, hour]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Business hours</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          These drive which booking slots guests can see.
        </p>
      </div>

      <Card className="max-w-2xl p-7">
        <AdminForm
          action={saveBusinessHours}
          submitLabel="Save hours"
          successMessage="Opening hours updated"
        >
          <div className="flex flex-col gap-4">
            {WEEKDAYS.map((label, weekday) => {
              const hour = byWeekday.get(weekday);
              return (
                <div
                  key={weekday}
                  className="border-border/70 grid items-center gap-3 border-b pb-4 last:border-0 sm:grid-cols-[7rem_auto_1fr_1fr]"
                >
                  <span className="text-sm font-medium">{label}</span>

                  <label className="text-muted-foreground flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name={`is_closed_${weekday}`}
                      defaultChecked={hour?.is_closed ?? false}
                      className="accent-gold-500 size-4"
                    />
                    Closed
                  </label>

                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Opens</span>
                    <input
                      type="time"
                      name={`open_time_${weekday}`}
                      defaultValue={hour?.open_time?.slice(0, 5) ?? "09:00"}
                      className="border-input bg-card h-10 flex-1 rounded-lg border px-3 text-sm"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Closes</span>
                    <input
                      type="time"
                      name={`close_time_${weekday}`}
                      defaultValue={hour?.close_time?.slice(0, 5) ?? "19:00"}
                      className="border-input bg-card h-10 flex-1 rounded-lg border px-3 text-sm"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </AdminForm>
      </Card>
    </div>
  );
}
