import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = { title: "New password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <Card className="p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Choose a new password</h1>
      <p className="text-muted-foreground mb-7 text-sm">
        Pick something you have not used before.
      </p>
      <ResetPasswordForm />
    </Card>
  );
}
