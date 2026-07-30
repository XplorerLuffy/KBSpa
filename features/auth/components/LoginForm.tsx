"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginValues } from "@/schemas/auth.schema";
import { signIn } from "@/features/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";

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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-gold-700 dark:text-gold-300 text-xs hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && (
          <p role="alert" className="text-destructive text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Sign in
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        New here?{" "}
        <Link href="/signup" className="text-gold-700 dark:text-gold-300 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
