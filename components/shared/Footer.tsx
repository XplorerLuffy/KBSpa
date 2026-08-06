import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/shared/BrandIcons";
import { Logo } from "@/components/shared/Logo";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "@/features/marketing/components/NewsletterForm";
import { NAV_LINKS } from "@/lib/constants";
import type { Category, SiteSettings } from "@/types/domain";

export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-olive-900 text-cream-200 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo inverted size={112} src={settings.logo_url} />
            <p className="text-cream-200/70 max-w-xs text-sm leading-relaxed">
              {settings.tagline ?? "Relax, Renew and Reconnect with Yourself"} Premium beauty and
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

          <nav aria-label="Footer services">
            <h2 className="text-gold-300 mb-4 font-serif text-base">Our Services</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/services?category=${category.slug}`}
                      className="text-cream-200/75 hover:text-gold-300 transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/services"
                    className="text-cream-200/75 hover:text-gold-300 transition-colors"
                  >
                    All treatments
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <h2 className="text-gold-300 font-serif text-base">Newsletter</h2>
            <p className="text-cream-200/70 text-sm leading-relaxed">
              Subscribe to get updates and special offers.
            </p>
            <NewsletterForm contactEmail={settings.email} />
            <ul className="text-cream-200/75 mt-2 flex flex-col gap-2.5 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="text-gold-400 size-4 shrink-0" />
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-gold-300">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="text-gold-400 mt-0.5 size-4 shrink-0" />
                  <span>{settings.address}</span>
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
