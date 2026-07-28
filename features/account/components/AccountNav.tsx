"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, LayoutDashboard, LogOut, Shield, UserRound } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/account/favorites", label: "Favourites", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28 lg:self-start">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/account" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-gold-50 text-gold-800 dark:bg-gold-900/20 dark:text-gold-300"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}

        {isAdmin && (
          <li>
            <Link
              href="/admin"
              className="text-olive-700 dark:text-olive-300 hover:bg-accent flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap"
            >
              <Shield className="size-4" aria-hidden />
              Admin panel
            </Link>
          </li>
        )}

        <li>
          <form action={signOut}>
            <button
              type="submit"
              className="text-muted-foreground hover:bg-accent flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
