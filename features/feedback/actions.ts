"use server";

import { createClient } from "@/lib/supabase/server";
import { feedbackSchema, type FeedbackValues } from "@/schemas/feedback.schema";

/**
 * Public submission from the unlisted /feedback page. Always lands as an
 * unapproved, unfeatured testimonial — the RLS policy rejects anything else,
 * so an admin has to approve it from Admin → Testimonials before it appears
 * on the public testimonials page.
 */
export async function submitFeedback(values: FeedbackValues) {
  const parsed = feedbackSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert({
    customer_name: parsed.data.customer_name,
    rating: parsed.data.rating,
    quote: parsed.data.quote,
    service_id: parsed.data.service_id || null,
    is_approved: false,
    is_featured: false,
  });

  if (error) {
    return {
      ok: false as const,
      error: "Could not send your feedback. Please try again.",
    };
  }

  return { ok: true as const };
}
