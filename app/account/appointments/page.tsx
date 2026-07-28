import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { AppointmentCard } from "@/features/account/components/AppointmentCard";
import { getMyAppointments } from "@/services/appointments.service";

export const metadata: Metadata = { title: "My appointments", robots: { index: false } };

export default async function AppointmentsPage() {
  const appointments = await getMyAppointments();
  const now = Date.now();

  const upcoming = appointments
    .filter(
      (item) =>
        new Date(item.start_time).getTime() >= now &&
        !["cancelled", "rejected", "completed"].includes(item.status),
    )
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

  const past = appointments.filter((item) => !upcoming.includes(item));

  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No upcoming appointments"
            description="Book a treatment and it will appear here."
            action={
              <Button asChild>
                <Link href="/booking">Book an appointment</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-5">
            {upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {past.length === 0 ? (
          <EmptyState icon={CalendarX} title="Nothing here yet" />
        ) : (
          <div className="flex flex-col gap-5">
            {past.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
