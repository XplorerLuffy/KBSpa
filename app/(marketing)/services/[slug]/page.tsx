import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/shared/JsonLd";
import { FadeIn } from "@/components/motion/FadeIn";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { FavoriteButton } from "@/features/account/components/FavoriteButton";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import {
  getServiceBySlug,
  getServices,
  getStaffForService,
} from "@/services/catalog.service";
import { getSettings } from "@/services/content.service";
import { buildServiceJsonLd } from "@/lib/seo/jsonld";
import { formatCurrency, formatDuration, initials } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };

  return {
    title: service.name,
    description: service.short_description ?? service.description ?? undefined,
    openGraph: {
      title: service.name,
      description: service.short_description ?? undefined,
      images: service.image_url ? [service.image_url] : undefined,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [therapists, settings, related, user] = await Promise.all([
    getStaffForService(service.id),
    getSettings(),
    getServices({ categorySlug: service.category?.slug, limit: 4 }),
    getSessionUser(),
  ]);

  let isFavorited = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("service_id")
      .eq("customer_id", user.id)
      .eq("service_id", service.id)
      .maybeSingle();
    isFavorited = Boolean(data);
  }

  const gallery = [service.image_url, ...service.gallery_urls].filter(
    (url): url is string => Boolean(url),
  );
  const relatedServices = related.filter((item) => item.id !== service.id).slice(0, 3);

  return (
    <>
      <JsonLd data={buildServiceJsonLd(service, settings)} />

      <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-muted-foreground mb-8 text-sm">
          <Link href="/services" className="hover:text-gold-700">
            Services
          </Link>
          {service.category && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/services?category=${service.category.slug}`}
                className="hover:text-gold-700"
              >
                {service.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex flex-col gap-8">
            <div className="bg-cream-200 relative aspect-[16/10] overflow-hidden rounded-3xl">
              {gallery[0] ? (
                <Image
                  src={gallery[0]}
                  alt={service.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="from-beige-200 via-cream-200 to-gold-100 flex size-full items-center justify-center bg-gradient-to-br">
                  <Sparkles className="text-gold-600/40 size-14" aria-hidden />
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {gallery.slice(1, 4).map((url) => (
                  <div
                    key={url}
                    className="bg-cream-200 relative aspect-[4/3] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="30vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-5">
              <h2 className="font-serif text-2xl font-medium">About this treatment</h2>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {service.description ?? service.short_description}
              </p>
            </div>

            {service.benefits.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl font-medium">Benefits</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm">
                      <span className="bg-olive-100 text-olive-700 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {therapists.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl font-medium">Available therapists</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {therapists.map((person) => (
                    <li
                      key={person.id}
                      className="border-border/70 bg-card flex items-center gap-4 rounded-2xl border p-4"
                    >
                      <Avatar className="size-12">
                        {person.photo_url && (
                          <AvatarImage src={person.photo_url} alt="" />
                        )}
                        <AvatarFallback>{initials(person.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{person.full_name}</p>
                        {person.title && (
                          <p className="text-muted-foreground text-xs">{person.title}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Card className="flex flex-col gap-6 p-7">
              {service.category && (
                <Badge variant="olive" className="w-fit">
                  <Tag className="size-3" aria-hidden />
                  {service.category.name}
                </Badge>
              )}

              <div className="flex flex-col gap-3">
                <h1 className="font-serif text-3xl leading-tight font-medium">
                  {service.name}
                </h1>
                {service.short_description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.short_description}
                  </p>
                )}
              </div>

              <Separator />

              <dl className="flex flex-col gap-4">
                {service.duration_minutes != null && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                      <Clock className="size-4" aria-hidden />
                      Duration
                    </dt>
                    <dd className="font-medium">
                      {formatDuration(service.duration_minutes)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground text-sm">Price</dt>
                  <dd className="font-serif text-2xl font-medium">
                    {formatCurrency(service.price)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href={`/booking?service=${service.slug}`}>
                    {service.duration_minutes != null ? "Book Appointment" : "Contact to Book"}
                  </Link>
                </Button>
                <FavoriteButton
                  serviceId={service.id}
                  initialFavorited={isFavorited}
                  isAuthenticated={Boolean(user)}
                />
              </div>

              <p className="text-muted-foreground text-center text-xs">
                {service.duration_minutes != null
                  ? "Free cancellation up to 24 hours before your appointment."
                  : "This treatment doesn't have online slots — we'll confirm a time with you directly."}
              </p>
            </Card>
          </aside>
        </div>

        {relatedServices.length > 0 && (
          <FadeIn className="mt-24">
            <h2 className="mb-10 font-serif text-2xl font-medium">
              You might also like
            </h2>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((item) => (
                <ServiceCard key={item.id} service={item} />
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </>
  );
}
