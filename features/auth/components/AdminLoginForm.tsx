"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginValues } from "@/schemas/auth.schema";
import { signIn } from "@/features/auth/actions";

/**
 * "Remember me" only controls whether this checkbox itself defaults to
 * checked on return visits — it doesn't change how long the session lasts.
 * The desktop app deliberately clears its saved session on every launch
 * (a shared front-desk machine, not a personal browser), and this form must
 * not quietly undo that by keeping people signed in longer than intended.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onBlur" });

  const onSubmit = async (values: LoginValues) => {
    const result = await signIn(values);
    if (result.ok) {
      toast.success("Welcome back");
      router.push(redirectTo);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="sr-only">
          Email
        </Label>
        <div className="relative">
          <Mail
            className="text-charcoal-400 absolute top-1/2 left-4 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
            className="bg-cream-100 rounded-full border-transparent pl-11"
          />
        </div>
        {errors.email && (
          <p role="alert" className="text-destructive px-1 text-xs">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="sr-only">
          Password
        </Label>
        <div className="relative">
          <Lock
            className="text-charcoal-400 absolute top-1/2 left-4 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            className="bg-cream-100 rounded-full border-transparent pl-11"
          />
        </div>
        {errors.password && (
          <p role="alert" className="text-destructive px-1 text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-1 text-sm">
        <label className="text-charcoal-400 flex items-center gap-2">
          <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-gold-700 hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className={cn(
          "bg-charcoal-900 hover:bg-charcoal-800 w-full rounded-full uppercase tracking-[0.15em] text-white",
        )}
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        Log in
      </Button>
    </form>
  );
}
