import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/shared/StarRating";
import { initials } from "@/lib/utils";
import type { TestimonialWithService } from "@/types/domain";

export function TestimonialCard({
  testimonial,
}: {
  testimonial: TestimonialWithService;
}) {
  return (
    <Card className="flex h-full flex-col gap-5 p-7">
      <Quote className="text-gold-500 size-7" aria-hidden />
      <StarRating rating={testimonial.rating} />
      <blockquote className="text-muted-foreground flex-1 leading-relaxed text-pretty">
        “{testimonial.quote}”
      </blockquote>
      <footer className="flex items-center gap-3 pt-1">
        <Avatar>
          {testimonial.avatar_url && (
            <AvatarImage src={testimonial.avatar_url} alt="" />
          )}
          <AvatarFallback>{initials(testimonial.customer_name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{testimonial.customer_name}</p>
          {testimonial.service && (
            <p className="text-muted-foreground text-xs">
              {testimonial.service.name}
            </p>
          )}
        </div>
      </footer>
    </Card>
  );
}
