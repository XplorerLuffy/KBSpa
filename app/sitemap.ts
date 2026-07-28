import type { MetadataRoute } from "next";
import { getAllServiceSlugs } from "@/services/catalog.service";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/gallery", priority: 0.7 },
    { path: "/about", priority: 0.7 },
    { path: "/testimonials", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
  }));

  const services = await getAllServiceSlugs();

  return [
    ...staticRoutes,
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: new Date(service.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
