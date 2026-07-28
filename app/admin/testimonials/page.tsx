import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { StarRating } from "@/components/shared/StarRating";
import { AdminForm, DeleteButton } from "@/features/admin/components/AdminForm";
import {
  CheckboxField,
  Field,
  SelectField,
  TextareaField,
} from "@/features/admin/components/Field";
import { deleteTestimonial, saveTestimonial } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Testimonials", robots: { index: false } };

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const [{ data: testimonials }, { data: services }] = await Promise.all([
    supabase
      .from("testimonials")
      .select("*, service:services(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("services").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Testimonials</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Only approved reviews appear on the public site.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-lg font-medium">Add a review</h2>
          <AdminForm
            action={saveTestimonial}
            submitLabel="Add review"
            successMessage="Review added"
          >
            <Field name="customer_name" label="Customer name" required />
            <Field
              name="rating"
              label="Rating (1–5)"
              type="number"
              min={1}
              max={5}
              defaultValue={5}
              required
            />
            <TextareaField name="quote" label="Review" rows={4} />
            <SelectField
              name="service_id"
              label="Treatment"
              options={(services ?? []).map((service) => ({
                value: service.id,
                label: service.name,
              }))}
            />
            <Field name="avatar_url" label="Photo URL" type="url" />
            <div className="flex flex-wrap gap-6">
              <CheckboxField name="is_approved" label="Approved" defaultChecked />
              <CheckboxField name="is_featured" label="Feature on homepage" />
            </div>
          </AdminForm>
        </Card>

        <div className="flex flex-col gap-4">
          {(testimonials ?? []).length === 0 ? (
            <EmptyState icon={MessageSquareQuote} title="No reviews yet" />
          ) : (
            (testimonials ?? []).map((testimonial) => {
              const service = testimonial.service as unknown as {
                name: string;
              } | null;
              return (
                <Card key={testimonial.id} className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{testimonial.customer_name}</span>
                      <StarRating rating={testimonial.rating} size={14} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={testimonial.is_approved ? "olive" : "neutral"}>
                        {testimonial.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      {testimonial.is_featured && <Badge>Featured</Badge>}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">“{testimonial.quote}”</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-xs">
                      {service?.name ?? "No treatment linked"}
                    </span>
                    <DeleteButton
                      action={async () => {
                        "use server";
                        return deleteTestimonial(testimonial.id);
                      }}
                      confirmMessage="Delete this review?"
                    />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
