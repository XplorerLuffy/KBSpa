import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";
import { getCurrentProfile } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false } };

export default async function AdminLoginPage() {
  const profile = await getCurrentProfile();
  if (profile?.role === "admin") redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="from-olive-900 via-charcoal-900 to-charcoal-900 absolute inset-0 bg-gradient-to-br">
        <div className="bg-olive-500/25 absolute -top-32 -left-24 size-[36rem] rounded-full blur-[130px]" />
        <div className="bg-olive-400/15 absolute -right-32 bottom-0 size-[30rem] rounded-full blur-[130px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="relative z-10 mb-[-2.75rem] flex justify-center">
          <Logo inverted href={null} size={88} className="drop-shadow-lg" />
        </div>
        <div className="rounded-3xl border border-white/40 bg-white/85 p-8 pt-14 shadow-soft-lg backdrop-blur-xl">
          <h1 className="text-charcoal-900 text-center font-serif text-xl font-medium">
            Admin Sign In
          </h1>
          <p className="text-charcoal-400 mb-7 text-center text-sm">
            Restricted to Kuenphen Beauty Spa staff.
          </p>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
