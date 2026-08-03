"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { feedbackSchema, type FeedbackValues } from "@/schemas/feedback.schema";
import { submitFeedback } from "@/features/feedback/actions";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating out of 5 stars"
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange(star)}
            className="rounded-md p-0.5 focus-visible:outline-ring focus-visible:outline-2"
          >
            <Star
              width={32}
              height={32}
              className={cn(
                "transition-colors",
                star <= shown ? "fill-gold-500 text-gold-500" : "text-beige-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function FeedbackForm({
  services,
}: {
  services: { id: string; name: string }[];
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    mode: "onBlur",
    defaultValues: { rating: 5, service_id: "" },
  });

  const onSubmit = async (values: FeedbackValues) => {
    const result = await submitFeedback(values);
    if (result.ok) {
      toast.success("Thank you for your feedback!", {
        description: "We appreciate you taking the time to share this with us.",
      });
      reset({ customer_name: "", quote: "", rating: 5, service_id: "" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label>Your rating</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarPicker value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="customer_name">Your name</Label>
        <Input
          id="customer_name"
          {...register("customer_name")}
          aria-invalid={Boolean(errors.customer_name)}
          aria-describedby={errors.customer_name ? "customer_name-error" : undefined}
        />
        {errors.customer_name && (
          <p id="customer_name-error" role="alert" className="text-destructive text-xs">
            {errors.customer_name.message}
          </p>
        )}
      </div>

      {services.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="service_id">Treatment (optional)</Label>
          <select
            id="service_id"
            {...register("service_id")}
            className="border-input bg-card focus-visible:outline-ring h-11 rounded-xl border px-4 text-sm focus-visible:outline-2"
          >
            <option value="">Select a treatment</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="quote">Your feedback</Label>
        <Textarea
          id="quote"
          rows={6}
          placeholder="Tell us about your visit..."
          {...register("quote")}
          aria-invalid={Boolean(errors.quote)}
          aria-describedby={errors.quote ? "quote-error" : undefined}
        />
        {errors.quote && (
          <p id="quote-error" role="alert" className="text-destructive text-xs">
            {errors.quote.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Submit feedback
      </Button>
    </form>
  );
}
