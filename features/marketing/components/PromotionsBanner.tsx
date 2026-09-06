import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Percent, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { formatCurrency } from "@/lib/utils";
import type { PromotionWithRelations } from "@/types/domain";

function discountLabel(promotion: PromotionWithRelations) {
  if (!promotion.discount_type || promotion.discount_value == null) return null;
  return promotion.discount_type === "percentage"
    ? `${promotion.discount_value}% OFF`
    : `${formatCurrency(promotion.discount_value)} OFF`;
}

function promotionLink(promotion: PromotionWithRelations) {
  if (promotion.service) return `/services/${promotion.service.slug}`;
  if (promotion.category) return `/services?category=${promotion.category.slug}`;
  return "/services";
}

export function PromotionsBanner({
  promotions,
}: {
  promotions: PromotionWithRelations[];
}) {
  if (promotions.length === 0) return null;

  return (
    <section className="section container-page">
      <SectionHeading
        eyebrow="Limited Time"
        title="Current Offers"
        description="Seasonal promotions and featured packages — available for a limited time."
      />

      <StaggerList
        className={
          promotions.length === 1
            ? "mt-10"
            : "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {promotions.map((promotion) => {
          const discount = discountLabel(promotion);
          return (
            <StaggerItem key={promotion.id}>
              <Link href={promotionLink(promotion)} className="group block h-full">
                <Card className="border-gold-200 hover:border-gold-400 hover:shadow-soft-lg relative flex h-full flex-col overflow-hidden transition-all duration-500">
                  {promotion.banner_image_url ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={promotion.banner_image_url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="from-gold-100 via-cream-200 to-olive-100 relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br">
                      <Sparkles className="text-gold-600/40 size-10" aria-hidden />
                    </div>
                  )}

                  {discount && (
                    <Badge className="absolute top-4 left-4 shadow-soft">
                      <Percent className="size-3" aria-hidden />
                      {discount}
                    </Badge>
                  )}

                  <div className="flex flex-1 flex-col gap-2 p-6">
                    <h3 className="font-serif text-xl font-medium">{promotion.title}</h3>
                    {promotion.description && (
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                        {promotion.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-sm">
                      {(promotion.service || promotion.category) && (
                        <span className="text-olive-600 dark:text-olive-300 inline-flex items-center gap-1.5">
                          <Tag className="size-3.5" aria-hidden />
                          {promotion.service?.name ?? promotion.category?.name}
                        </span>
                      )}
                      {promotion.ends_at && (
                        <span className="text-muted-foreground ml-auto">
                          Ends {format(new Date(promotion.ends_at), "d MMM")}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </section>
  );
}
