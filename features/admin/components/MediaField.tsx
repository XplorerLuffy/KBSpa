"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/features/admin/upload.actions";

/**
 * Upload control for any image/video setting.
 *
 * The chosen file is uploaded immediately and its public URL is held in a
 * hidden input, so the surrounding AdminForm keeps submitting a plain string
 * exactly as it did when this was a URL text box — no server action needed
 * changing.
 *
 * Pasting a URL is still offered behind a toggle: existing records already hold
 * external URLs, and the salon may want to point at an image hosted elsewhere.
 */
export function MediaField({
  name,
  label,
  folder,
  defaultValue = "",
  hint,
  accept = "image/*",
}: {
  name: string;
  label: string;
  /** Storage prefix — must be one the server action allows. */
  folder: string;
  defaultValue?: string;
  hint?: string;
  accept?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const isVideo = /\.(mp4|webm)(\?|$)/i.test(url);

  function handleFile(file: File | undefined) {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const result = await uploadMedia(formData);
      if (result.ok) {
        setUrl(result.url);
        toast.success("Uploaded");
      } else {
        toast.error(result.error);
      }
      // Allow re-picking the same file after a failure.
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${name}-file`}>{label}</Label>

      {/* What the form actually submits. */}
      <input type="hidden" name={name} value={url} />

      <div className="border-input bg-card flex flex-wrap items-center gap-4 rounded-xl border p-4">
        <div className="bg-cream-100 dark:bg-charcoal-800 relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {url ? (
            isVideo ? (
              <video src={url} muted playsInline className="size-full object-cover" />
            ) : (
              <Image
                src={url}
                alt=""
                fill
                sizes="96px"
                unoptimized
                className="object-contain"
              />
            )
          ) : (
            <ImagePlus className="text-muted-foreground size-7" aria-hidden />
          )}
          {pending && (
            <div className="absolute inset-0 grid place-items-center bg-black/40">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            id={`${name}-file`}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" aria-hidden />
              {url ? "Replace" : "Upload"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => setShowUrlInput((open) => !open)}
            >
              <Link2 className="size-4" aria-hidden />
              Use a link
            </Button>

            {url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setUrl("")}
              >
                <Trash2 className="size-4" aria-hidden />
                Remove
              </Button>
            )}
          </div>

          {showUrlInput && (
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              aria-label={`${label} URL`}
            />
          )}

          {!showUrlInput && url && (
            <p className="text-muted-foreground truncate text-xs" title={url}>
              {url}
            </p>
          )}
        </div>
      </div>

      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
