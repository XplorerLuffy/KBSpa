import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/shared/BrandIcons";
import { Logo } from "@/components/shared/Logo";
import { Separator } from "@/components/ui/separator";
import { NAV_LINKS, WEEKDAYS } from "@/lib/constants";
import type { BusinessHour, SiteSettings } from "@/types/domain";

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function Footer({
  settings,
  hours,
}: {
  settings: SiteSettings;
  hours: BusinessHour[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 text-cream-200 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo inverted src={settings.logo_url} />
            <p className="text-cream-200/70 max-w-xs text-sm leading-relaxed">
              {settings.tagline ?? "Relax. Refresh. Rejuvenate."} Premium beauty and
              wellness treatments, tailored just for you.
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <Link
                  href={settings.facebook_url}
                  aria-label="Facebook"
                  className="hover:bg-gold-500 hover:text-charcoal-900 rounded-full bg-white/10 p-2.5 transition-colors"
                >
                  <FacebookIcon className="size-4" />
                </Link>
              )}
              {settings.instagram_url && (
                <Link
                  href={settings.instagram_url}
                  aria-label="Instagram"
                  className="hover:bg-gold-500 hover:text-charcoal-900 rounded-full bg-white/10 p-2.5 transition-colors"
                >
                  <InstagramIcon className="size-4" />
                </Link>
              )}
              {settings.whatsapp && (
                <Link
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  aria-label="WhatsApp"
                  className="hover:bg-gold-500 hover:text-charcoal-900 rounded-full bg-white/10 p-2.5 transition-colors"
                >
                  <MessageCircle className="size-4" />
                </Link>
              )}
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-gold-300 mb-4 font-serif text-base">Explore</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream-200/75 hover:text-gold-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="text-cream-200/75 hover:text-gold-300 transition-colors"
                >
                  Book Appointment
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-gold-300 mb-4 font-serif text-base">Opening Hours</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {hours.map((hour) => (
                <li key={hour.weekday} className="flex justify-between gap-4">
                  <span className="text-cream-200/75">{WEEKDAYS[hour.weekday]}</span>
                  <span className="text-cream-200/60">
                    {hour.is_closed
                      ? "Closed"
                      : `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-gold-300 mb-4 font-serif text-base">Get in Touch</h2>
            <ul className="flex flex-col gap-3 text-sm">
              {settings.address && (
                <li className="flex gap-3">
                  <MapPin className="text-gold-400 mt-0.5 size-4 shrink-0" />
                  <span className="text-cream-200/75">{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-3">
                  <Phone className="text-gold-400 mt-0.5 size-4 shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="text-cream-200/75 hover:text-gold-300"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-3">
                  <Mail className="text-gold-400 mt-0.5 size-4 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-cream-200/75 hover:text-gold-300 break-all"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="text-cream-200/50 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <p>
            © {year} {settings.business_name ?? "Kuenphen Beauty Spa"}. All rights
            reserved.
          </p>
          <p>Since 2020 · Crafted with care</p>
        </div>
      </div>
    </footer>
  );
}
