/**
 * Pure validation for admin media uploads.
 *
 * Kept out of the "use server" module so it can be unit tested — a file marked
 * "use server" may only export async functions, and importing it drags in the
 * Supabase server client and Next's request context.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Mime type -> file extension. Also the allow-list. */
export const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** Prefixes a caller may write to, so a path cannot be chosen freely. */
export const ALLOWED_FOLDERS = [
  "logo",
  "hero",
  "services",
  "staff",
  "gallery",
  "testimonials",
  "promotions",
  "categories",
] as const;

export const DEFAULT_FOLDER = "gallery";

export function resolveFolder(requested: unknown): string {
  const value = String(requested ?? "");
  return (ALLOWED_FOLDERS as readonly string[]).includes(value)
    ? value
    : DEFAULT_FOLDER;
}

export type UploadCheck =
  | { ok: true; extension: string }
  | { ok: false; error: string };

export function checkUpload(type: string, size: number): UploadCheck {
  if (!size) return { ok: false, error: "No file was selected." };

  if (size > MAX_UPLOAD_BYTES) {
    const mb = (size / 1024 / 1024).toFixed(1);
    return { ok: false, error: `That file is ${mb} MB — the limit is 10 MB.` };
  }

  const extension = ALLOWED_TYPES[type];
  if (!extension) {
    return {
      ok: false,
      error: "Use a PNG, JPG, WebP, AVIF, GIF, SVG, MP4 or WebM file.",
    };
  }

  return { ok: true, extension };
}

/** Random filename: avoids collisions and stops one upload clobbering another. */
export function buildObjectPath(folder: string, extension: string): string {
  return `${resolveFolder(folder)}/${crypto.randomUUID()}.${extension}`;
}
