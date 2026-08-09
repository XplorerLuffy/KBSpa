"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookingStepper } from "@/features/booking/components/BookingStepper";
import { useBooking } from "@/features/booking/context/BookingProvider";
import { createAppointment, getAvailableSlots } from "@/features/booking/actions";
import {
  bookingDetailsSchema,
  type BookingDetailsValues,
} from "@/schemas/booking.schema";
import { GENDERS, GENDER_LABELS } from "@/lib/constants";
import { cn, formatCurrency, formatDuration, initials } from "@/lib/utils";
import type { ServiceWithCategory, Staff } from "@/types/domain";

const DAYS_AHEAD = 30;

type Props = {
  services: ServiceWithCategory[];
  staffByService: Record<string, Staff[]>;
  preselectedSlug?: string;
  contact: { phone?: string; whatsapp?: string };
};

export function BookingWizard({
  services,
  staffByService,
  preselectedSlug,
  contact,
}: Props) {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const service = services.find((item) => item.id === state.serviceId) ?? null;
  const therapists = state.serviceId ? (staffByService[state.serviceId] ?? []) : [];
  const therapist = therapists.find((item) => item.id === state.staffId) ?? null;

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: DAYS_AHEAD }, (_, index) => addDays(today, index));
  }, []);

  // Deep link from a service page: /booking?service=<slug>
  useEffect(() => {
    if (!preselectedSlug || state.serviceId) return;
    const match = services.find((item) => item.slug === preselectedSlug);
    if (match) {
      dispatch({ type: "SET_SERVICE", serviceId: match.id, serviceSlug: match.slug });
      if (match.duration_minutes != null) setStep(1);
    }
  }, [preselectedSlug, services, state.serviceId, dispatch]);

  useEffect(() => {
    if (step !== 3 || !state.staffId || !state.serviceId || !state.date) return;

    let cancelled = false;
    setLoadingSlots(true);
    setSlots(null);

    getAvailableSlots({
      staffId: state.staffId,
      serviceId: state.serviceId,
      date: state.date,
    }).then((result) => {
      if (cancelled) return;
      setSlots(result.ok ? result.slots : []);
      setLoadingSlots(false);
      if (!result.ok) toast.error(result.error);
    });

    return () => {
      cancelled = true;
    };
  }, [step, state.staffId, state.serviceId, state.date]);

  const detailsForm = useForm<BookingDetailsValues>({
    resolver: zodResolver(bookingDetailsSchema),
    mode: "onBlur",
    defaultValues: {
      name: state.name || "",
      email: state.email || "",
      phone: state.phone || "",
      notes: state.notes,
    },
  });

  const submitBooking = async () => {
    if (!state.serviceId || !state.staffId || !state.slot) return;

    setSubmitting(true);
    const result = await createAppointment({
      serviceId: state.serviceId,
      staffId: state.staffId,
      slot: state.slot,
      details: {
        name: state.name,
        phone: state.phone,
        email: state.email,
        gender: state.gender ?? undefined,
        notes: state.notes || undefined,
      },
    });
    setSubmitting(false);

    if (result.ok) {
      router.push(`/booking/confirmation/${result.appointmentId}`);
      return;
    }

    toast.error(result.error);
    // The slot list is stale whenever the booking was rejected as unavailable.
    setStep(3);
    setSlots(null);
  };

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: "SET_SERVICE",
                      serviceId: item.id,
                      serviceSlug: item.slug,
                    });
                    if (item.duration_minutes != null) setStep(1);
                  }}
                  className={cn(
                    "border-border hover:border-gold-400 hover:shadow-soft flex cursor-pointer flex-col gap-2 rounded-2xl border p-5 text-left transition-all",
                    state.serviceId === item.id && "border-gold-500 bg-gold-50",
                  )}
                >
                  {item.category && (
                    <span className="text-olive-600 dark:text-olive-300 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">
                      {item.category.name}
                    </span>
                  )}
                  <span className="font-serif text-lg font-medium">{item.name}</span>
                  <span className="text-muted-foreground flex items-center gap-3 text-sm">
                    {item.duration_minutes != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" aria-hidden />
                        {formatDuration(item.duration_minutes)}
                      </span>
                    ) : (
                      <span>Contact to book</span>
                    )}
                    <span className="font-medium">{formatCurrency(item.price)}</span>
                  </span>
                </button>
              ))}
            </div>

            {service && service.duration_minutes == null && (
              <Card className="border-gold-300 bg-gold-50 flex flex-col gap-3 p-5">
                <p className="text-sm font-medium">
                  {service.name} doesn&apos;t have fixed appointment slots
                </p>
                <p className="text-muted-foreground text-sm">
                  Reach out and we&apos;ll arrange a time with you directly.
                </p>
                <div className="flex flex-wrap gap-2">
                  {contact.phone && (
                    <Button asChild size="sm">
                      <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                        <Phone />
                        Call us
                      </a>
                    </Button>
                  )}
                  {contact.whatsapp && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle />
                        WhatsApp us
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        );

      case 1:
        return therapists.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="No therapist available"
            description="No one is currently assigned to this treatment. Please choose another."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {therapists.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  dispatch({ type: "SET_STAFF", staffId: person.id });
                  setStep(2);
                }}
                className={cn(
                  "border-border hover:border-gold-400 hover:shadow-soft flex cursor-pointer items-center gap-4 rounded-2xl border p-5 text-left transition-all",
                  state.staffId === person.id && "border-gold-500 bg-gold-50",
                )}
              >
                <Avatar className="size-14">
                  {person.photo_url && <AvatarImage src={person.photo_url} alt="" />}
                  <AvatarFallback>{initials(person.full_name)}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col">
                  <span className="font-medium">{person.full_name}</span>
                  {person.title && (
                    <span className="text-muted-foreground text-xs">{person.title}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
            {dates.map((date) => {
              const value = format(date, "yyyy-MM-dd");
              const selected = state.date === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    dispatch({ type: "SET_DATE", date: value });
                    setStep(3);
                  }}
                  className={cn(
                    "border-border hover:border-gold-400 flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-2 py-4 transition-all",
                    selected && "border-gold-500 bg-gold-500 text-charcoal-900",
                  )}
                >
                  <span className="text-xs font-medium tracking-wide uppercase opacity-70">
                    {format(date, "EEE")}
                  </span>
                  <span className="font-serif text-xl font-medium">
                    {format(date, "d")}
                  </span>
                  <span className="text-xs opacity-70">{format(date, "MMM")}</span>
                  {isSameDay(date, new Date()) && (
                    <span className="text-[0.65rem] font-medium">Today</span>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 3:
        if (loadingSlots || slots === null) {
          return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          );
        }

        return slots.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Nothing available on this day"
            description="We are closed or fully booked. Please pick another date."
            action={
              <Button variant="outline" onClick={() => setStep(2)}>
                Choose another date
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  dispatch({ type: "SET_SLOT", slot });
                  setStep(4);
                }}
                className={cn(
                  "border-border hover:border-gold-400 cursor-pointer rounded-xl border py-3 text-sm font-medium transition-all",
                  state.slot === slot && "border-gold-500 bg-gold-500 text-charcoal-900",
                )}
              >
                {format(new Date(slot), "h:mm a")}
              </button>
            ))}
          </div>
        );

      case 4:
        return (
          <form
            id="booking-details"
            onSubmit={detailsForm.handleSubmit((values) => {
              dispatch({
                type: "SET_DETAILS",
                details: {
                  name: values.name,
                  phone: values.phone,
                  email: values.email,
                  gender: values.gender ?? null,
                  notes: values.notes ?? "",
                },
              });
              setStep(5);
            })}
            className="flex flex-col gap-5"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...detailsForm.register("name")} />
                {detailsForm.formState.errors.name && (
                  <p role="alert" className="text-destructive text-xs">
                    {detailsForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...detailsForm.register("phone")} />
                {detailsForm.formState.errors.phone && (
                  <p role="alert" className="text-destructive text-xs">
                    {detailsForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...detailsForm.register("email")} />
              {detailsForm.formState.errors.email && (
                <p role="alert" className="text-destructive text-xs">
                  {detailsForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-medium">Gender (optional)</legend>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "border-border hover:border-gold-400 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors",
                      detailsForm.watch("gender") === value &&
                        "border-gold-500 bg-gold-50 text-gold-800",
                    )}
                  >
                    <input
                      type="radio"
                      value={value}
                      className="sr-only"
                      {...detailsForm.register("gender")}
                    />
                    {GENDER_LABELS[value]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes for your therapist (optional)</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Allergies, areas to focus on, anything we should know…"
                {...detailsForm.register("notes")}
              />
            </div>
          </form>
        );

      case 5:
        return (
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-4 p-6">
              <dl className="flex flex-col gap-3.5 text-sm">
                <Row label="Treatment" value={service?.name ?? "—"} />
                <Row
                  label="Duration"
                  value={
                    service?.duration_minutes != null
                      ? formatDuration(service.duration_minutes)
                      : "—"
                  }
                />
                <Row label="Therapist" value={therapist?.full_name ?? "—"} />
                <Row
                  label="When"
                  value={
                    state.slot
                      ? format(new Date(state.slot), "EEEE d MMMM, h:mm a")
                      : "—"
                  }
                />
                <Separator />
                <Row label="Name" value={state.name} />
                <Row label="Phone" value={state.phone} />
                <Row label="Email" value={state.email} />
                {state.gender && (
                  <Row label="Gender" value={GENDER_LABELS[state.gender]} />
                )}
                {state.notes && <Row label="Notes" value={state.notes} />}
                <Separator />
                <div className="flex items-center justify-between">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-serif text-2xl font-medium">
                    {service ? formatCurrency(service.price) : "—"}
                  </dd>
                </div>
              </dl>
            </Card>

            <p className="text-muted-foreground text-sm">
              Payment is taken in the salon. Use your confirmation page after booking to
              cancel or reschedule, free of charge up to 24 hours before your appointment.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const canGoNext = () => {
    if (step === 4) return true;
    if (step === 5) return Boolean(state.slot);
    return false;
  };

  return (
    <div className="flex flex-col gap-10">
      <BookingStepper current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {stepContent()}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
        >
          <ArrowLeft />
          Back
        </Button>

        {step === 4 && (
          <Button type="submit" form="booking-details" size="lg">
            Review booking
            <ArrowRight />
          </Button>
        )}

        {step === 5 && (
          <Button
            size="lg"
            onClick={submitBooking}
            disabled={!canGoNext() || submitting}
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Check />}
            Confirm booking
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
