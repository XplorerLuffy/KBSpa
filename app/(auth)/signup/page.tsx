import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignupPage() {
  return (
    <Card className="p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Create your account</h1>
      <p className="text-muted-foreground mb-7 text-sm">
        Book faster, and keep track of every visit.
      </p>
      <SignupForm />
    </Card>
  );
}
