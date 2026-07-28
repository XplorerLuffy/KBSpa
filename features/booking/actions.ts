"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingDetailsSchema } from "@/schemas/booking.schema";
import type { BookingDetailsValues } from "@/schemas/booking.schema";

export async function getAvailableSlots(input: {
  staffId: string;
  serviceId: string;
  date: string;
  excludeAppointmentId?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_staff_id: input.staffId,
    p_service_id: input.serviceId,
    p_date: input.date,
    p_exclude_appointment_id: input.excludeAppointmentId,
  });

  if (error) return { ok: false as const, error: "Could not load availability." };
  return { ok: true as const, slots: (data ?? []).map((row) => row.slot) };
}

/** Maps the RPC's raised exceptions onto messages a guest can act on. */
function bookingErrorMessage(message: string) {
  if (message.includes("SLOT_UNAVAILABLE") || message.includes("23P01")) {
    return "That time was just booked. Please choose another slot.";
  }
  if (message.includes("SLOT_IN_PAST")) return "That time has already passed.";
  if (message.includes("SERVICE_UNAVAILABLE")) return "That treatment is unavailable.";
  if (message.includes("STAFF_UNAVAILABLE")) return "That therapist is unavailable.";
  if (message.includes("AUTH_REQUIRED")) return "Please sign in to confirm your booking.";
  return "Could not confirm your booking. Please try again.";
}

export async function createAppointment(input: {
  serviceId: string;
  staffId: string;
  slot: string;
  details: BookingDetailsValues;
}) {
  const parsed = bookingDetailsSchema.safeParse(input.details);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check your details and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    p_service_id: input.serviceId,
    p_staff_id: input.staffId,
    p_start_time: input.slot,
    p_contact_name: parsed.data.name,
    p_contact_phone: parsed.data.phone,
    p_contact_email: parsed.data.email,
    p_gender: parsed.data.gender,
    p_notes: parsed.data.notes,
  });

  if (error) return { ok: false as const, error: bookingErrorMessage(error.message) };

  revalidatePath("/account/appointments");
  return { ok: true as const, appointmentId: (data as { id: string }).id };
}

export async function cancelAppointment(appointmentId: string, reason?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_appointment", {
    p_appointment_id: appointmentId,
    p_reason: reason,
  });

  if (error) {
    return {
      ok: false as const,
      error: error.message.includes("NOT_CANCELLABLE")
        ? "This appointment can no longer be cancelled."
        : "Could not cancel the appointment.",
    };
  }

  revalidatePath("/account/appointments");
  revalidatePath("/admin/bookings");
  return { ok: true as const };
}

export async function rescheduleAppointment(input: {
  appointmentId: string;
  slot: string;
  staffId?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reschedule_appointment", {
    p_appointment_id: input.appointmentId,
    p_start_time: input.slot,
    p_staff_id: input.staffId,
  });

  if (error) return { ok: false as const, error: bookingErrorMessage(error.message) };

  revalidatePath("/account/appointments");
  revalidatePath("/admin/bookings");
  return { ok: true as const };
}
