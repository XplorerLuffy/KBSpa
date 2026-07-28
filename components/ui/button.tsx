import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default:
          "bg-gold-500 text-charcoal-900 shadow-soft hover:bg-gold-400 hover:shadow-gold active:scale-[0.98]",
        secondary:
          "bg-olive-600 text-white shadow-soft hover:bg-olive-700 active:scale-[0.98]",
        outline:
          "border border-gold-500 text-gold-700 bg-transparent hover:bg-gold-50 dark:text-gold-300 dark:hover:bg-gold-900/20",
        glass:
          "glass border border-white/40 text-white hover:bg-white/25 shadow-soft",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-gold-700 underline-offset-4 hover:underline dark:text-gold-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-9 text-base",
        icon: "size-10",
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
