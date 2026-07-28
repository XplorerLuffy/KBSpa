import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { getBusinessHours, getSettings } from "@/services/content.service";
import { WEEKDAYS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find Kuenphen Beauty Spa — address, opening hours, phone, WhatsApp and email.",
};

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default async function ContactPage() {
  const [settings, hours] = await Promise.all([getSettings(), getBusinessHours()]);
  const today = new Date().getDay();

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Contact us"
        description="Questions about a treatment, or want help choosing? Send us a message and we will get back to you."
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-5 p-7">
              <h2 className="font-serif text-xl font-medium">Visit us</h2>
              <ul className="flex flex-col gap-4 text-sm">
                {settings.address && (
                  <li className="flex gap-3">
                    <MapPin className="text-gold-600 mt-0.5 size-4 shrink-0" aria-hidden />
                    <span className="text-muted-foreground">{settings.address}</span>
                  </li>
                )}
                {settings.phone && (
                  <li className="flex gap-3">
                    <Phone className="text-gold-600 mt-0.5 size-4 shrink-0" aria-hidden />
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, "")}`}
                      className="hover:text-gold-700"
                    >
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li className="flex gap-3">
                    <Mail className="text-gold-600 mt-0.5 size-4 shrink-0" aria-hidden />
                    <a
                      href={`mailto:${settings.email}`}
                      className="hover:text-gold-700 break-all"
                    >
                      {settings.email}
                    </a>
                  </li>
                )}
                {settings.whatsapp && (
                  <li className="flex gap-3">
                    <MessageCircle
                      className="text-gold-600 mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                      className="hover:text-gold-700"
                    >
                      Message us on WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </Card>

            <Card className="flex flex-col gap-4 p-7">
              <h2 className="font-serif text-xl font-medium">Opening hours</h2>
              <ul className="flex flex-col gap-2.5 text-sm">
                {hours.map((hour) => (
                  <li
                    key={hour.weekday}
                    className={
                      hour.weekday === today
                        ? "text-gold-700 dark:text-gold-300 flex justify-between font-medium"
                        : "text-muted-foreground flex justify-between"
                    }
                  >
                    <span>{WEEKDAYS[hour.weekday]}</span>
                    <span>
                      {hour.is_closed
                        ? "Closed"
                        : `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {settings.map_embed_url && (
              <Card className="overflow-hidden p-0">
                <iframe
                  src={settings.map_embed_url}
                  title="Map showing the location of Kuenphen Beauty Spa"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full border-0"
                />
              </Card>
            )}
          </div>

          <Card className="p-7 sm:p-9">
            <h2 className="mb-6 font-serif text-xl font-medium">Send a message</h2>
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
