import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <Card className="p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Reset your password</h1>
      <p className="text-muted-foreground mb-7 text-sm">
        Enter your email and we will send you a reset link.
      </p>
      <ForgotPasswordForm />
    </Card>
  );
}
