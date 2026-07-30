import { HomeView } from "@/features/marketing/components/HomeView";
import { getCategories, getServices } from "@/services/catalog.service";
import {
  getHomeStats,
  getSettings,
  getTestimonials,
} from "@/services/content.service";

export default async function HomePage() {
  const [settings, featured, categories, testimonials, stats] =
    await Promise.all([
      getSettings(),
      getServices({ featuredOnly: true, limit: 6 }),
      getCategories(),
      getTestimonials({ featuredOnly: true, limit: 6 }),
      getHomeStats(),
    ]);

  return (
    <HomeView
      settings={settings}
      featured={featured}
      categories={categories}
      testimonials={testimonials}
      stats={stats}
    />
  );
}
