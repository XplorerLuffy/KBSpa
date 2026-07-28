"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="from-cream-200 via-cream-100 to-background flex min-h-screen flex-col items-center justify-center gap-7 bg-gradient-to-br px-4 text-center">
      <p className="text-gold-700 font-serif text-6xl font-medium">500</p>
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-medium">Something went wrong</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          We hit an unexpected error. Please try again — if it keeps happening, get in
          touch and we will book you in by phone.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
