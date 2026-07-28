import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { JsonLd } from "@/components/shared/JsonLd";
import { getBusinessHours, getSettings } from "@/services/content.service";
import { getSessionUser } from "@/lib/supabase/server";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, hours, user] = await Promise.all([
    getSettings(),
    getBusinessHours(),
    getSessionUser(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={buildLocalBusinessJsonLd(settings, hours)} />
      <Navbar isAuthenticated={Boolean(user)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} hours={hours} />
    </div>
  );
}
