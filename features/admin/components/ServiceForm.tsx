"use client";

import { AdminForm } from "@/features/admin/components/AdminForm";
import {
  CheckboxField,
  Field,
  SelectField,
  TextareaField,
} from "@/features/admin/components/Field";
import { saveService } from "@/features/admin/actions";
import type { Category, Service } from "@/types/domain";
import { MediaField } from "@/features/admin/components/MediaField";

export function ServiceForm({
  categories,
  service,
}: {
  categories: Category[];
  service?: Service;
}) {
  return (
    <AdminForm
      action={(formData) => saveService(formData, service?.id)}
      submitLabel={service ? "Save changes" : "Create service"}
      successMessage={service ? "Service updated" : "Service created"}
      redirectTo="/admin/services"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name" defaultValue={service?.name} required />
        <Field
          name="slug"
          label="URL slug"
          defaultValue={service?.slug}
          hint="Lowercase, hyphen-separated. Used in the page address."
          required
        />
      </div>

      <SelectField
        name="category_id"
        label="Category"
        defaultValue={service?.category_id ?? ""}
        options={categories.map((category) => ({
          value: category.id,
          label: category.name,
        }))}
      />

      <Field
        name="short_description"
        label="Short description"
        defaultValue={service?.short_description ?? ""}
        hint="One line, shown on service cards."
      />

      <TextareaField
        name="description"
        label="Full description"
        rows={5}
        defaultValue={service?.description ?? ""}
      />

      <TextareaField
        name="benefits"
        label="Benefits"
        rows={4}
        defaultValue={service?.benefits.join("\n")}
        hint="One benefit per line."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          name="duration_minutes"
          label="Duration (minutes)"
          type="number"
          min={5}
          step={5}
          defaultValue={service?.duration_minutes ?? 60}
          required
        />
        <Field
          name="price"
          label="Price (Nu.)"
          type="number"
          min={0}
          step={50}
          defaultValue={service?.price ?? 0}
          required
        />
        <Field
          name="sort_order"
          label="Sort order"
          type="number"
          min={0}
          defaultValue={service?.sort_order ?? 0}
        />
      </div>

      <MediaField
        name="image_url"
        label="Image"
        folder="services"
        defaultValue={service?.image_url ?? ""}
      />

      <div className="flex flex-wrap gap-6">
        <CheckboxField
          name="is_active"
          label="Visible on the site"
          defaultChecked={service?.is_active ?? true}
        />
        <CheckboxField
          name="is_featured"
          label="Feature on the homepage"
          defaultChecked={service?.is_featured ?? false}
        />
      </div>
    </AdminForm>
  );
}
