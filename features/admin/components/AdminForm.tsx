"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/run-action";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Shared wrapper for every admin create/edit form: submits the FormData to a
 * server action, toasts the outcome, then refreshes (or navigates away).
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Save",
  successMessage = "Saved",
  redirectTo,
  onDone,
}: {
  action: (formData: FormData) => Promise<Result>;
  children: React.ReactNode;
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const form = event.currentTarget;

        startTransition(async () => {
          const result = await runAction(() => action(formData));
          if (!result) return; // already reported by runAction
          if (result.ok) {
            toast.success(successMessage);
            onDone?.();
            if (redirectTo) router.push(redirectTo);
            else form.reset();
            router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
      className="flex flex-col gap-5"
    >
      {children}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}

export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Delete this item?",
}: {
  action: () => Promise<Result>;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await runAction(() => action());
          if (!result) return; // already reported by runAction
          if (result.ok) {
            toast.success("Deleted");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}
