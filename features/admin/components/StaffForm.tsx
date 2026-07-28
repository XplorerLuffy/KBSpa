"use client";

import { AdminForm } from "@/features/admin/components/AdminForm";
import { CheckboxField, Field, TextareaField } from "@/features/admin/components/Field";
import { saveStaff } from "@/features/admin/actions";
import type { Service, Staff } from "@/types/domain";

export function StaffForm({
  services,
  staff,
  assignedServiceIds = [],
}: {
  services: Service[];
  staff?: Staff;
  assignedServiceIds?: string[];
}) {
  return (
    <AdminForm
      action={(formData) => saveStaff(formData, staff?.id)}
      submitLabel={staff ? "Save changes" : "Add staff member"}
      successMessage={staff ? "Staff member updated" : "Staff member added"}
      redirectTo="/admin/staff"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="full_name"
          label="Full name"
          defaultValue={staff?.full_name}
          required
        />
        <Field
          name="title"
          label="Title"
          defaultValue={staff?.title ?? ""}
          hint="For example: Senior Aesthetician"
        />
      </div>

      <TextareaField name="bio" label="Bio" rows={4} defaultValue={staff?.bio ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="photo_url"
          label="Photo URL"
          type="url"
          defaultValue={staff?.photo_url ?? ""}
        />
        <Field
          name="sort_order"
          label="Sort order"
          type="number"
          defaultValue={staff?.sort_order ?? 0}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Treatments they perform</legend>
        <p className="text-muted-foreground text-xs">
          Guests can only book this therapist for the treatments ticked here.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label key={service.id} className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                name="service_ids"
                value={service.id}
                defaultChecked={assignedServiceIds.includes(service.id)}
                className="accent-gold-500 size-4"
              />
              {service.name}
            </label>
          ))}
        </div>
      </fieldset>

      <CheckboxField
        name="is_active"
        label="Available for bookings"
        defaultChecked={staff?.is_active ?? true}
      />
    </AdminForm>
  );
}
