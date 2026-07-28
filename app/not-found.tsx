import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export default function NotFound() {
  return (
    <div className="from-cream-200 via-cream-100 to-background flex min-h-screen flex-col items-center justify-center gap-7 bg-gradient-to-br px-4 text-center">
      <Logo />
      <p className="text-gold-700 font-serif text-6xl font-medium">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-medium">This page slipped away</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          The page you are looking for does not exist, or has moved.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    </div>
  );
}
