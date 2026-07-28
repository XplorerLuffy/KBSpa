import { redirect } from "next/navigation";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { getCurrentProfile } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guards this path; re-check here so the page cannot render
  // for a non-admin even if it is reached another way.
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/admin");
  if (profile.role !== "admin") redirect("/");

  return (
    <div className="bg-cream-100 dark:bg-charcoal-900 flex min-h-screen">
      <AdminSidebar name={profile.full_name ?? "Admin"} />
      <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:pl-8">
        {children}
      </main>
    </div>
  );
}
