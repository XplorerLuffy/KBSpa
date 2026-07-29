import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { AccountNav } from "@/features/account/components/AccountNav";
import { getCurrentProfile } from "@/lib/supabase/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/account");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAuthenticated />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-28 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-olive-600 dark:text-olive-300 text-[0.6875rem] font-semibold tracking-[0.22em] uppercase">
            My Account
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium">
            Hello, {profile.full_name?.split(" ")[0] ?? "there"}
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <AccountNav isAdmin={profile.role === "admin"} />
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
