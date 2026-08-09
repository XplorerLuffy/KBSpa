import Image from "next/image";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { ServiceWithCategory } from "@/types/domain";

export function ServiceCard({ service }: { service: ServiceWithCategory }) {
  return (
    <Card className="group hover:border-olive-200 motion-safe:hover:-translate-y-1 flex h-full flex-col overflow-hidden border-transparent bg-card/90 transition-all duration-500 ease-[var(--ease-calm)] hover:shadow-soft-lg">
      <Link
        href={`/services/${service.slug}`}
        className="bg-cream-300 relative block aspect-[4/3] overflow-hidden"
        tabIndex={-1}
        aria-hidden="true"
      >
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="from-olive-100 via-cream-200 to-beige-100 flex size-full items-center justify-center bg-gradient-to-br">
            <Sparkles className="text-olive-500/40 size-9" />
          </div>
        )}
        {service.is_featured && (
          <Badge className="absolute top-4 left-4 shadow-soft">Featured</Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {service.category && (
          <span className="text-olive-600 dark:text-olive-300 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">
            {service.category.name}
          </span>
        )}

        <h3 className="font-serif text-xl leading-snug font-medium">
          <Link
            href={`/services/${service.slug}`}
            className="transition-colors hover:text-olive-700 dark:hover:text-olive-300"
          >
            {service.name}
          </Link>
        </h3>

        {service.short_description && (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {service.short_description}
          </p>
        )}

        <div className="text-muted-foreground mt-auto flex items-center justify-between gap-3 pt-2 text-sm">
          {service.duration_minutes != null ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {formatDuration(service.duration_minutes)}
            </span>
          ) : (
            <span className="text-xs">Contact to book</span>
          )}
          <span className="text-charcoal-900 dark:text-cream-100 font-serif text-lg font-medium">
            {formatCurrency(service.price)}
          </span>
        </div>

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={`/booking?service=${service.slug}`}>Book</Link>
        </Button>
      </div>
    </Card>
  );
}
