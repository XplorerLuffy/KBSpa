import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <Card className="p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Welcome back</h1>
      <p className="text-muted-foreground mb-7 text-sm">
        Sign in to manage your appointments.
      </p>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
