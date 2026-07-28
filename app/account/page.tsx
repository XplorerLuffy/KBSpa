import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CalendarClock, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { AppointmentCard } from "@/features/account/components/AppointmentCard";
import { getMyAppointments } from "@/services/appointments.service";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const [appointments, { count: favouriteCount }] = await Promise.all([
    getMyAppointments(),
    supabase.from("favorites").select("service_id", { count: "exact", head: true }),
  ]);

  const now = Date.now();
  const upcoming = appointments
    .filter(
      (item) =>
        new Date(item.start_time).getTime() >= now &&
        !["cancelled", "rejected", "completed"].includes(item.status),
    )
    .sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

  const completed = appointments.filter((item) => item.status === "completed").length;

  const stats = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarClock },
    { label: "Completed", value: completed, icon: CalendarCheck },
    { label: "Favourites", value: favouriteCount ?? 0, icon: Heart },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4 p-6">
            <span className="bg-gold-100 text-gold-700 flex size-11 items-center justify-center rounded-2xl">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-serif text-2xl font-medium">{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl font-medium">Next appointment</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/account/appointments">View all</Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing booked yet"
            description="Treat yourself — pick a treatment and see live availability."
            action={
              <Button asChild>
                <Link href="/booking">Book an appointment</Link>
              </Button>
            }
          />
        ) : (
          <AppointmentCard appointment={upcoming[0]} />
        )}
      </section>
    </div>
  );
}
