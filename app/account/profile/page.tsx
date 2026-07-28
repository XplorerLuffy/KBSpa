import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/features/account/components/ProfileForm";
import { getCurrentProfile } from "@/lib/supabase/server";
import type { Gender } from "@/lib/constants";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <Card className="max-w-xl p-7">
      <h2 className="mb-1 font-serif text-xl font-medium">Your details</h2>
      <p className="text-muted-foreground mb-7 text-sm">
        We use these when confirming your appointments.
      </p>
      <ProfileForm
        email={profile.email ?? ""}
        defaultValues={{
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          gender: (profile.gender as Gender | null) ?? undefined,
        }}
      />
    </Card>
  );
}
