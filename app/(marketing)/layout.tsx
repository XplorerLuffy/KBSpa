import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { JsonLd } from "@/components/shared/JsonLd";
import { getBusinessHours, getSettings } from "@/services/content.service";
import { getCategories } from "@/services/catalog.service";
import { getSessionUser } from "@/lib/supabase/server";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, hours, categories, user] = await Promise.all([
    getSettings(),
    getBusinessHours(),
    getCategories(),
    getSessionUser(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={buildLocalBusinessJsonLd(settings, hours)} />
      <Navbar isAuthenticated={Boolean(user)} logoUrl={settings.logo_url} overDarkHero />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} categories={categories.slice(0, 4)} />
    </div>
  );
}
