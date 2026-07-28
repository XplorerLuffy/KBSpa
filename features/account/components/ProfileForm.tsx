"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/features/account/actions";
import { profileSchema, type ProfileValues } from "@/schemas/admin.schema";
import { GENDERS, GENDER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProfileForm({
  email,
  defaultValues,
}: {
  email: string;
  defaultValues: ProfileValues;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const result = await updateProfile(values);
        if (result.ok) toast.success("Profile saved");
        else toast.error(result.error);
      })}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly />
        <p className="text-muted-foreground text-xs">
          Contact us if you need to change your email address.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && (
          <p className="text-destructive text-xs">{errors.full_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" {...register("phone")} />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Gender</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((value) => (
            <label
              key={value}
              className={cn(
                "border-border hover:border-gold-400 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors",
                watch("gender") === value && "border-gold-500 bg-gold-50 text-gold-800",
              )}
            >
              <input
                type="radio"
                value={value}
                className="sr-only"
                {...register("gender")}
              />
              {GENDER_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
