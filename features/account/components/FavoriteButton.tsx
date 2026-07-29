"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/features/account/actions";
import { cn } from "@/lib/utils";
import { runAction } from "@/lib/run-action";

export function FavoriteButton({
  serviceId,
  initialFavorited,
  isAuthenticated,
}: {
  serviceId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/services`);
      return;
    }

    startTransition(async () => {
      const result = await runAction(() => toggleFavorite(serviceId));
      if (!result) return;
      if (result.ok) {
        setFavorited(result.favorited);
        toast.success(result.favorited ? "Added to favourites" : "Removed from favourites");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      className="w-full"
    >
      <Heart className={cn(favorited && "fill-gold-500 text-gold-500")} />
      {favorited ? "Saved to favourites" : "Save to favourites"}
    </Button>
  );
}
