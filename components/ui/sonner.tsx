"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border-border !bg-card !text-foreground !shadow-soft-lg !font-sans",
          description: "!text-muted-foreground",
          actionButton: "!bg-gold-500 !text-charcoal-900 !rounded-full",
          cancelButton: "!bg-muted !text-muted-foreground !rounded-full",
        },
      }}
    />
  );
}
