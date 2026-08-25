"use client";

import { AdminForm } from "@/features/admin/components/AdminForm";
import { Field } from "@/features/admin/components/Field";
import { changePassword } from "@/features/admin/actions";

export function ChangePasswordForm() {
  return (
    <AdminForm
      action={changePassword}
      submitLabel="Update password"
      successMessage="Password updated"
    >
      <Field
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          required
        />
        <Field
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
    </AdminForm>
  );
}
