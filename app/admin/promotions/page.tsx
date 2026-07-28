import type { Metadata } from "next";
import { format } from "date-fns";
import { Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminForm, DeleteButton } from "@/features/admin/components/AdminForm";
import {
  CheckboxField,
  Field,
  SelectField,
  TextareaField,
} from "@/features/admin/components/Field";
import { deletePromotion, savePromotion } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Promotions", robots: { index: false } };

export default async function AdminPromotionsPage() {
  const supabase = await createClient();
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Promotions</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Seasonal offers and featured packages.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-lg font-medium">New promotion</h2>
          <AdminForm
            action={savePromotion}
            submitLabel="Create promotion"
            successMessage="Promotion created"
          >
            <Field name="title" label="Title" required />
            <TextareaField name="description" label="Description" rows={3} />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                name="discount_type"
                label="Discount type"
                options={[
                  { value: "percentage", label: "Percentage off" },
                  { value: "fixed", label: "Fixed amount off" },
                ]}
              />
              <Field name="discount_value" label="Discount value" type="number" min={0} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="starts_at" label="Starts" type="datetime-local" />
              <Field name="ends_at" label="Ends" type="datetime-local" />
            </div>
            <Field name="banner_image_url" label="Banner image URL" type="url" />
            <CheckboxField name="is_active" label="Active" />
          </AdminForm>
        </Card>

        <div className="flex flex-col gap-4">
          {(promotions ?? []).length === 0 ? (
            <EmptyState icon={Percent} title="No promotions yet" />
          ) : (
            (promotions ?? []).map((promotion) => (
              <Card key={promotion.id} className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-serif text-lg font-medium">
                    {promotion.title}
                  </span>
                  <Badge variant={promotion.is_active ? "olive" : "neutral"}>
                    {promotion.is_active ? "Active" : "Draft"}
                  </Badge>
                </div>
                {promotion.description && (
                  <p className="text-muted-foreground text-sm">{promotion.description}</p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs">
                    {promotion.ends_at
                      ? `Ends ${format(new Date(promotion.ends_at), "d MMM yyyy")}`
                      : "No end date"}
                  </span>
                  <DeleteButton
                    action={async () => {
                      "use server";
                      return deletePromotion(promotion.id);
                    }}
                    confirmMessage="Delete this promotion?"
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
