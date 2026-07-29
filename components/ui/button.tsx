import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // min-h-11 keeps every button at a comfortable tap target on touch screens.
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[0.01em] transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-calm)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gold-500 text-charcoal-900 shadow-soft hover:bg-gold-400 hover:shadow-gold",
        secondary:
          "bg-olive-600 text-white shadow-soft hover:bg-olive-700",
        outline:
          "border border-beige-300 bg-transparent text-charcoal-800 hover:border-olive-400 hover:bg-olive-50 dark:border-border dark:text-cream-100 dark:hover:bg-olive-900/25",
        glass:
          "glass border border-white/45 text-white hover:bg-white/25 shadow-soft",
        ghost: "text-charcoal-600 hover:bg-accent hover:text-accent-foreground dark:text-cream-200",
        link: "min-h-0 text-olive-700 underline-offset-4 hover:underline hover:text-olive-800 dark:text-olive-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 min-h-9 px-4 text-xs",
        lg: "h-13 px-8 text-[0.95rem]",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
