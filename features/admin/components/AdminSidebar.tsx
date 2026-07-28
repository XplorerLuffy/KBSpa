"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarOff,
  Clock4,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Percent,
  Settings,
  Sparkles,
  Tags,
  UserRound,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    label: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/bookings/calendar", label: "Calendar", icon: Clock4 },
    ],
  },
  {
    label: "Catalogue",
    links: [
      { href: "/admin/services", label: "Services", icon: Sparkles },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/staff", label: "Staff", icon: UserRound },
    ],
  },
  {
    label: "People",
    links: [{ href: "/admin/customers", label: "Customers", icon: Users }],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/promotions", label: "Promotions", icon: Percent },
    ],
  },
  {
    label: "Configuration",
    links: [
      { href: "/admin/business-hours", label: "Business hours", icon: Clock4 },
      { href: "/admin/holidays", label: "Holidays", icon: CalendarOff },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-muted-foreground mb-2 px-3 text-[0.65rem] font-medium tracking-[0.18em] uppercase">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.links.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : href === "/admin/bookings"
                    ? pathname === "/admin/bookings"
                    : pathname.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-gold-100 text-gold-800 dark:bg-gold-900/25 dark:text-gold-300"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function AdminSidebar({ name }: { name: string }) {
  return (
    <>
      <aside className="bg-card border-border/70 hidden w-64 shrink-0 flex-col gap-8 border-r px-4 py-6 lg:flex">
        <Logo href="/admin" />
        <nav aria-label="Admin" className="flex-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="border-border/70 flex flex-col gap-2 border-t pt-4">
          <p className="text-muted-foreground px-3 text-xs">Signed in as {name}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="text-muted-foreground hover:bg-accent flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="bg-card border-border/70 fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Logo href="/admin" size={36} />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open admin menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetTitle className="sr-only">Admin menu</SheetTitle>
            <SheetClose asChild>
              <div>
                <NavLinks />
              </div>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-14 lg:hidden" aria-hidden />
    </>
  );
}
