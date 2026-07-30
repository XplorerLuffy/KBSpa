"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/schemas/auth.schema";
import { requestPasswordReset } from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-olive-100 text-olive-700 flex size-14 items-center justify-center rounded-full">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <h2 className="font-serif text-xl font-medium">Check your inbox</h2>
        <p className="text-muted-foreground text-sm">
          If an account exists for that email, a reset link is on its way.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await requestPasswordReset(values);
        setSent(true);
      })}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && (
          <p role="alert" className="text-destructive text-xs">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Send reset link
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="text-gold-700 dark:text-gold-300 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
