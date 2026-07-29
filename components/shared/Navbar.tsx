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
}: {
  isAuthenticated: boolean;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // The hero is only full-bleed on the home page; every other page needs a solid bar.
  const overHero = pathname === "/";
  const solid = scrolled || !overHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "glass border-b border-border/60 shadow-soft"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Logo inverted={!solid} src={logoUrl} />

        <ul className="hidden items-center gap-1 lg:flex">
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
                        ? "text-gold-700 bg-gold-50 dark:text-gold-300 dark:bg-gold-900/20"
                        : "text-charcoal-600 hover:text-gold-700 dark:text-cream-200 dark:hover:text-gold-300"
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

        <div className="flex items-center gap-2">
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
              <Logo href="/" className="mb-4" src={logoUrl} />
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
