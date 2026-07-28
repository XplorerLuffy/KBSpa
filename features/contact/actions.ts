"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema, type ContactValues } from "@/schemas/booking.schema";

export async function submitContactMessage(values: ContactValues) {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) {
    return {
      ok: false as const,
      error: "Could not send your message. Please try again.",
    };
  }

  return { ok: true as const };
}
