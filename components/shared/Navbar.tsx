"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, UserRound } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar({
  isAuthenticated,
  logoUrl,
  overDarkHero = false,
}: {
  isAuthenticated: boolean;
  logoUrl?: string | null;
  /**
   * True only when the home hero shows the salon's own photo/video behind a
   * dark scrim. The default hero is a light wash, where white nav text would be
   * invisible — so the bar stays in its normal dark-on-light treatment.
   */
  overDarkHero?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // The hero is only full-bleed on the home page, and only readable behind a
  // transparent bar when it has a dark backdrop.
  const overHero = pathname === "/" && overDarkHero;
  const solid = scrolled || !overHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto grid h-[4.25rem] max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[18px] px-4 transition-all duration-300 sm:h-20 sm:px-6",
          solid
            ? "glass border border-white/50 shadow-soft dark:border-white/10"
            : "border border-transparent bg-transparent",
        )}
      >
        {/* Deliberately taller than the bar itself — at nav height the arced
            wordmark baked into the badge is illegible, and letting a
            circular medallion logo overlap the header slightly reads as
            intentional rather than like an overflow bug. */}
        <Logo inverted={!solid} size={104} src={logoUrl} />

        <ul className="hidden items-center justify-self-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    solid
                      ? active
                        ? "text-olive-800 bg-olive-100 dark:text-olive-200 dark:bg-olive-900/30"
                        : "text-charcoal-600 hover:text-olive-800 hover:bg-olive-50 dark:text-cream-200 dark:hover:text-olive-200 dark:hover:bg-olive-900/20"
                      : active
                        ? "text-white bg-white/15"
                        : "text-white/85 hover:text-white hover:bg-white/10",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-self-end gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(!solid && "text-white hover:bg-white/15 hover:text-white")}
          >
            <Link href="/search" aria-label="Search services">
              <Search />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn("hidden sm:inline-flex", !solid && "text-white hover:bg-white/15 hover:text-white")}
          >
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              aria-label={isAuthenticated ? "My account" : "Sign in"}
            >
              <UserRound />
            </Link>
          </Button>

          <Button asChild className="hidden sm:inline-flex">
            <Link href="/booking">Book Now</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("lg:hidden", !solid && "text-white hover:bg-white/15 hover:text-white")}
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo href="/" size={100} className="mb-4" src={logoUrl} />
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        className="hover:bg-accent block rounded-xl px-4 py-3 text-sm font-medium"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
                <li>
                  <SheetClose asChild>
                    <Link
                      href={isAuthenticated ? "/account" : "/login"}
                      className="hover:bg-accent block rounded-xl px-4 py-3 text-sm font-medium"
                    >
                      {isAuthenticated ? "My Account" : "Sign In"}
                    </Link>
                  </SheetClose>
                </li>
              </ul>
              <SheetClose asChild>
                <Button asChild className="mt-2 w-full">
                  <Link href="/booking">Book Appointment</Link>
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
