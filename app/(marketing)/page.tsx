import { HomeView } from "@/features/marketing/components/HomeView";
import { getCategories, getServices } from "@/services/catalog.service";
import {
  getActivePromotions,
  getBusinessHours,
  getHomeStats,
  getSettings,
  getTestimonials,
} from "@/services/content.service";

export default async function HomePage() {
  const [settings, featured, categories, testimonials, stats, hours, promotions] =
    await Promise.all([
      getSettings(),
      getServices({ featuredOnly: true, limit: 4 }),
      getCategories(),
      getTestimonials({ featuredOnly: true, limit: 6 }),
      getHomeStats(),
      getBusinessHours(),
      getActivePromotions(),
    ]);

  return (
    <HomeView
      settings={settings}
      featured={featured}
      categories={categories}
      testimonials={testimonials}
      stats={stats}
      hours={hours}
      promotions={promotions}
    />
  );
}
