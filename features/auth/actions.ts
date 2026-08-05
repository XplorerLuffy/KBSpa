"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type ForgotPasswordValues,
  type LoginValues,
  type ResetPasswordValues,
  type SignupValues,
} from "@/schemas/auth.schema";
import { absoluteUrl } from "@/lib/utils";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function signIn(values: LoginValues): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check your details and try again." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { ok: false, error: "Incorrect email or password." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUp(values: SignupValues): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check your details and try again." };

  const supabase = await createClient();

  const { data: isAdminEmail } = await supabase.rpc("email_is_admin", {
    check_email: parsed.data.email,
  });
  if (isAdminEmail) {
    return {
      ok: false,
      error: "This email is reserved for admin sign-in. Please use a different email.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: absoluteUrl("/auth/callback"),
      data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
    },
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message.toLowerCase().includes("already")
          ? "An account with this email already exists."
          : "Could not create your account. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function requestPasswordReset(
  values: ForgotPasswordValues,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: absoluteUrl("/auth/callback?next=/reset-password"),
  });

  // Always report success so the form cannot be used to discover registered emails.
  return { ok: true };
}

export async function updatePassword(
  values: ResetPasswordValues,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Check your password and try again." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return { ok: false, error: "Could not update your password." };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
