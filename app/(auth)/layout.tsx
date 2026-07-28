import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-cream-200 via-cream-100 to-background dark:from-charcoal-800 dark:via-charcoal-900 dark:to-background flex min-h-screen flex-col items-center justify-center bg-gradient-to-br px-4 py-16">
      <main id="main" className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Logo />
          <Link
            href="/"
            className="text-muted-foreground hover:text-gold-700 inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to site
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
